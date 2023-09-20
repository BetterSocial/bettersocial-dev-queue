const moment = require("moment");
const { calcUserScore } = require("./calc-user-score");
const {
  calcQualitativeCriteriaScore,
} = require("./calc-score-on-create-account");

const { USER_SCORE_WEIGHT } = require("./formula/constant");
const UsersFunction = require("../../databases/functions/users");

const calcScoreOnSyncUserScore = async (data, userDoc, userScoreList) => {
  console.debug("Starting calcScoreOnSyncUserScore");

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
  data.emails.forEach((email) => {
    // check if it's edu emails
    if (email.endsWith(".edu")) {
      console.debug(`Email ${email} is detected as edu emails`);
      eduEmails.push(email);
    } else if (!email.match(/.+\@(gmail|yahoo|hotmail|outlook)\..+/)) {
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
          //   throw new Error("Followed user data is not found, with id: " + follow);
        }
      }
    }
  }

  await calcUserScore(userDoc);
  userDoc.updated_at = timestamp;

  userDoc.USER_SCORE_WEIGHT = USER_SCORE_WEIGHT;
  const userFollower = await UsersFunction.getUserFollowerList(userDoc._id);
  userDoc.following = userFollower;
  userDoc.F_score_update = userFollower.length;

  updateUserScoreDocs.push({
    updateOne: {
      filter: { _id: userDoc._id }, // query data to be updated
      update: { $set: userDoc }, // updates
      upsert: true,
    },
  });

  console.log("updateUserScoreDocs => ", updateUserScoreDocs);
  // const result = []
  const result = await userScoreList.bulkWrite(updateUserScoreDocs);

  console.debug(`Update on create account event: ${JSON.stringify(result)}`);
  return userDoc;
};

module.exports = {
  calcScoreOnSyncUserScore,
};
