require('dotenv').config;
const moment = require("moment");
const { calcUserPostScore } = require("./calc-user-post-score");
const REGULAR_TIME_FORMAT = "YYYY-MM-DD HH:mm:ss";

const calcScoreOnUpvotePost = async(data, userScoreDoc, userScoreList, postScoreDoc, userPostScoreDoc, userPostScoreList) => {
  console.debug("Starting calcScoreOnUpvotePost");

  /*
    _id: userId+":"+feedId,
    user_id: userId,
    feed_id: feedId,
    author_id: "",
    topics_followed: 0,
    author_follower: false,
    second_degree_follower: false,
    domain_follower: false,
    p1_score: 0.0,
    upvote_count: 0,
    downvote_count: 0,
    block_count: 0,
    seen_count: 0,
    p_prev_score: 0.0,
    post_score: 0.0,
    user_post_score: 0.0,
    activity_log: {},
    anomaly_activities: {
      upvote_time: "",
      cancel_upvote_time: "",
      downvote_time: "",
      cancel_downvote_time: "",
      block_time: "",
      unblock_time: "",
    },
    created_at: timestamp,
    updated_at: timestamp,
 */

  userPostScoreDoc.author_id = postScoreDoc.author_id;
  userPostScoreDoc.post_score = postScoreDoc.post_score;

  // add activity log if not exists yet. Assumed the activity is unique by time, it means
  // there won't be different event in the same second.
  const existingActivityLog = userPostScoreDoc.activity_log[data.activity_time];
  if (existingActivityLog) {
    console.debug("calcScoreOnUpvotePost -> skip upvote count since it already exists in the log : " + existingActivityLog);
  } else {
    userPostScoreDoc.activity_log[data.activity_time] = 'upvote';

    // check if there is anomaly of cancel upvote that happened after this time of activity,
    // then reset the anomaly of cancel upvote
    if (userPostScoreDoc.anomaly_activities.cancel_upvote_time !== "" &&
      moment.utc(userPostScoreDoc.anomaly_activities.cancel_upvote_time).diff(
        moment.utc(data.activity_time), 'seconds') > 0) {
      console.debug("calcScoreOnUpvotePost -> reset cancel upvote time");
      userPostScoreDoc.anomaly_activities.cancel_upvote_time = "";
    } else {
      if (userPostScoreDoc.upvote_count > 0) {
        // already upvoted, but upvote again ? Probably this upvote event should be happened
        // before cancel upvote. Put it in anomaly of upvote event if the anomaly is empty,
        // or current anomaly time is earlier than this activity time
        if (userPostScoreDoc.anomaly_activities.upvote_time === "" ||
          moment.utc(data.activity_time).diff(
            moment.utc(userPostScoreDoc.anomaly_activities.upvote_time), 'seconds') > 0) {
          console.debug("calcScoreOnUpvotePost -> set anomaly upvote time");
          userPostScoreDoc.anomaly_activities.upvote_time = data.activity_time;
        }
      } else {
        console.debug("calcScoreOnUpvotePost -> set upvote count = 1");
        userPostScoreDoc.upvote_count = 1;
        userPostScoreDoc.downvote_count = 0;
      }
    }
  }

  await calcUserPostScore(userPostScoreDoc);

  userPostScoreDoc.updated_at = moment().utc().format(REGULAR_TIME_FORMAT); // format current time in utc

  const result = await userPostScoreList.updateOne(
    { _id : userPostScoreDoc._id }, // query data to be updated
    { $set : userPostScoreDoc }, // updates
    { upsert: true } // options
  );

  console.debug("Update on upvote post event: " + JSON.stringify(result));
  console.debug("calcScoreOnUpvotePost => user post score doc: " + JSON.stringify(userPostScoreDoc));

  return result;
};

module.exports = {
  calcScoreOnUpvotePost
}
