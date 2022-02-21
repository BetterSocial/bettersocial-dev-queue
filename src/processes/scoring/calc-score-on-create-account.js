require('dotenv').config;
const { calcUserScore } = require("./calc-user-score");
const { isStringBlankOrNull } = require("../../utils");
const moment = require("moment");

const calcScoreOnCreateAccount = async(data, userDoc, userScoreList) => {
  console.debug("Starting calcScoreOnCreateAccount");

  userDoc.register_time = data.register_time;

  // loop the followed topics, and add it to array if it's not exists
  data.topics.forEach((followedTopic) => {
    if (userDoc.topics.indexOf(followedTopic) === -1) {
      userDoc.topics.push(followedTopic);
      console.debug("Topic " + followedTopic + " not exists yet in user_score document, add it");
    } else {
      console.debug("Topic " + followedTopic + " already exists in user_score document, skip it");
    }
  });

  const eduEmails = [];
  const nonPrivateEmails = [];
  data.emails.forEach(function(email) {
    // check if it's edu emails
    if (email.endsWith(".edu")) {
      console.debug("Email " + email + " is detected as edu emails");
      eduEmails.push(email);
    } else if ( !email.match(/.+\@(gmail|yahoo|hotmail|outlook)\..+/)) {// check if it's non private emails by domain
      console.debug("Email " + email + " is detected as non private emails");
      nonPrivateEmails.push(email);
    } else {
      console.debug("Email " + email + " is not detected as edu nor non private emails");
    }
  });

  userDoc.confirmed_acc = {
    edu_emails: eduEmails,
    non_private_email: nonPrivateEmails,
    twitter_acc: {
      acc_name: data.twitter_acc,
      num_followers: 0, // TODO check number of followers
    },
  };

  // TODO set user_att_score, get from database

  // calculate q_score
  userDoc.q_score = calcQualitativeCriteriaScore(userDoc);
  if (data.follow_users && data.follow_users.length > 0) {
    data.follow_users.forEach(follow => {
      if (userDoc.following.indexOf(follow) == -1) {
        userDoc.following.push(follow);
      }
    });
  }

  await calcUserScore(userDoc);
  userDoc.updated_at = moment().utc().format("YYYY-MM-DD HH:mm:ss"); // format current time in utc

  const result = await userScoreList.updateOne(
    { _id : userDoc._id }, // query data to be updated
    { $set : userDoc }, // updates
    { upsert: true } // options
  );

  console.debug("Update on create account event: " + JSON.stringify(result));
  return result;
};

const calcQualitativeCriteriaScore = (userDoc) => {

  const WEDU = process.env.W_EDU || 1.4;
  const WEMAIL = process.env.W_EMAIL || 1.2;
  const WTWITTER = process.env.W_TWITTER || 2;
  const WUSERATT = process.env.W_USERATT || 1;

  let q = 1;
  const countNonPrivateEmails = userDoc.confirmed_acc.non_private_email.length;

  // multiplicate if user has confirmed '.edu' address
  if (userDoc.confirmed_acc.edu_emails.length > 0) {
    q = q * WEDU;
  }

  // multiplicate if user has confirmed other non-private email addresses
  if (countNonPrivateEmails > 0) {
    if (countNonPrivateEmails > 3) {
      countNonPrivateEmails = 3;
    }

    q = q * (WEMAIL ** (countNonPrivateEmails ** 0.25) );
  }

  // multiplicate if user has confirmed a twitter account with >200 followers
  if (!isStringBlankOrNull(userDoc.confirmed_acc.twitter_acc.acc_name) &&
    userDoc.confirmed_acc.twitter_acc.num_followers > 200) {
    q = q * WTWITTER;
  }

  if (userDoc.user_att_score > 0) {
    q = q * userDoc.user_att_score;
  }

  return q;
}

module.exports = {
  calcScoreOnCreateAccount
}
