require("dotenv").config();
const moment = require("moment");
const { calcUserScore } = require("./calc-user-score");
const { isStringBlankOrNull } = require("../../utils");

const calcScoreOnCreateAccount = async (data, userDoc, userScoreList) => {
  console.debug("Starting calcScoreOnCreateAccount");

  const timestamp = moment().utc().format("YYYY-MM-DD HH:mm:ss");
  userDoc.register_time = data.register_time;

  // loop the followed topics, and add it to array if it's not exists
  data.topics.forEach((followedTopic) => {
    if (userDoc.topics.indexOf(followedTopic) === -1) {
      userDoc.topics.push(followedTopic);
      console.debug(
        `Topic ${followedTopic} not exists yet in user_score document, add it`
      );
    } else {
      console.debug(
        `Topic ${followedTopic} already exists in user_score document, skip it`
      );
    }
  });

  const eduEmails = [];
  const nonPrivateEmails = [];
  data.emails.forEach(function (email) {
    // check if it's edu emails
    if (email.endsWith(".edu")) {
      console.debug(`Email ${email} is detected as edu emails`);
      eduEmails.push(email);
    } else if (!email.match(/.+@(gmail|yahoo|hotmail|outlook)\..+/)) {
      // check if it's non private emails by domain
      console.debug(`Email ${email} is detected as non private emails`);
      nonPrivateEmails.push(email);
    } else {
      console.debug(
        `Email ${email} is not detected as edu nor non private emails`
      );
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
  const updateUserScoreDocs = [];
  if (data.follow_users && data.follow_users.length > 0) {
    for (const follow of data.follow_users) {
      if (userDoc.following.indexOf(follow) == -1) {
        userDoc.following.push(follow);

        const followedUserScoreDoc = await userScoreList.findOne({
          _id: follow,
        });
        if (followedUserScoreDoc) {
          followedUserScoreDoc.F_score_update += 1;
          followedUserScoreDoc.updated_at = timestamp;

          updateUserScoreDocs.push({
            updateOne: {
              filter: { _id: followedUserScoreDoc._id }, // query data to be updated
              update: {
                $set: {
                  F_score_update: followedUserScoreDoc.F_score_update,
                  updated_at: followedUserScoreDoc.updated_at,
                },
              }, // updates
              upsert: false,
            },
          });
        } else {
          throw new Error(
            `Followed user data is not found, with id: ${follow}`
          );
        }
      }
    }
  }

  await calcUserScore(userDoc);
  userDoc.updated_at = timestamp;

  updateUserScoreDocs.push({
    updateOne: {
      filter: { _id: userDoc._id }, // query data to be updated
      update: { $set: userDoc }, // updates
      upsert: true,
    },
  });

  const result = await userScoreList.bulkWrite(updateUserScoreDocs);

  console.debug(`Update on create account event: ${JSON.stringify(result)}`);
  return result;
};

const calcQualitativeCriteriaScore = (userDoc) => {
  const WEDU = process.env.W_EDU || 1.4;
  const WEMAIL = process.env.W_EMAIL || 1.2;
  const WTWITTER = process.env.W_TWITTER || 2;

  let q = 1;
  let countNonPrivateEmails = userDoc.confirmed_acc.non_private_email.length;

  // multiplicate if user has confirmed '.edu' address
  if (userDoc.confirmed_acc.edu_emails.length > 0) {
    q *= WEDU;
  }

  // multiplicate if user has confirmed other non-private email addresses
  if (countNonPrivateEmails > 0) {
    if (countNonPrivateEmails > 3) {
      countNonPrivateEmails = 3;
    }

    q *= WEMAIL ** (countNonPrivateEmails ** 0.25);
  }

  // multiplicate if user has confirmed a twitter account with >200 followers
  if (
    !isStringBlankOrNull(userDoc.confirmed_acc.twitter_acc.acc_name) &&
    userDoc.confirmed_acc.twitter_acc.num_followers > 200
  ) {
    q *= WTWITTER;
  }

  if (userDoc.user_att_score > 0) {
    q *= userDoc.user_att_score;
  }

  return q;
};

module.exports = {
  calcScoreOnCreateAccount,
  calcQualitativeCriteriaScore,
};
