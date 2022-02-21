require('dotenv').config;
const moment = require("moment");
const { calcUserPostScore } = require("./calc-user-post-score");
const { calcPostScore } = require("./calc-post-score");
const { isStringBlankOrNull, postInteractionPoint } = require("../../utils");
const REGULAR_TIME_FORMAT = "YYYY-MM-DD HH:mm:ss";

/*
 * Update last downvotes information, with condition for update:
 * 1. Update the counter in userScoreDoc whenever it's make sense to update.
 *    By the mean of make sense:
 *    1. last_update is earlier from this activity time, less than a day (means this info have been updated at least from daily process)
 *    2. earliest_time is not more than 7 days earlier from this activity time. If it's more than 7 days before, surely it's not an uptodated counter.
 * 2. Updated fields:
 *    1. earliest_time --> if currently empty (it's the first time doing the activity)
 *    2. last_time --> with activity time
 *    3. last update --> with activity time
 *    4. counter --> increment 1
 * 2. Update the counter of upvotes too, if it is upvoted previously.
 */
function updateLastDownvotes(userScoreDoc, activityTime, isUpvoted) {
  // Get the activity time in moment object, so it would be easier to count the difference between times.
  const momentActivityTime = moment.utc(activityTime, REGULAR_TIME_FORMAT, true);

  const lastDownvotes = userScoreDoc.last_downvotes;
  if (!isStringBlankOrNull(lastDownvotes.last_update)) {
    const dayDiffLastUpdateAndPostTime = moment.duration(momentActivityTime.diff(moment.utc(lastDownvotes.last_update, REGULAR_TIME_FORMAT, true))).as('days');

    console.debug("calcScoreOnDownvotePost:updateLastDownvotes -> there is last blocks data");

    // continue, if last_update is earlier from activity time, less than a day.
    // note: minus duration means last update is later than activity time.
    if (dayDiffLastUpdateAndPostTime >= 0 && dayDiffLastUpdateAndPostTime <= 1) {
      console.debug("calcScoreOnDownvotePost:updateLastDownvotes -> last_update is earlier from activity time and less than a day");

      // continue, if earliest_time is empty or not more than 7 days earlier from activity time
      let isUpdate = true;
      if (!isStringBlankOrNull(lastDownvotes.earliest_time)) {
        const dayDiffEarliestTimeAndActivityTime = moment.duration(momentActivityTime.diff(moment.utc(lastDownvotes.earliest_time, REGULAR_TIME_FORMAT, true))).as('days');

        if (dayDiffEarliestTimeAndActivityTime > 7) {
          console.debug("calcScoreOnDownvotePost:updateLastDownvotes -> earliest_time is more than 7 days earlier from activity time");
          isUpdate = false;
        }
      } else {
        console.debug("calcScoreOnDownvotePost:updateLastDownvotes -> earliest_time is empty");
        lastDownvotes.earliest_time = activityTime;
      }

      if (isUpdate) {
        const currentCount = lastDownvotes.counter;

        console.debug("calcScoreOnDownvotePost:updateLastDownvotes -> update the counter");
        lastDownvotes.last_update = activityTime;
        lastDownvotes.last_time = activityTime;
        lastDownvotes.counter = currentCount + 1;
      }
    }
  }

  const lastUpvotes = userScoreDoc.last_upvotes;
  if (isUpvoted) {
    const dayDiffLastUpdateUpvoteAndPostTime = moment.duration(momentActivityTime.diff(moment.utc(lastUpvotes.last_update, REGULAR_TIME_FORMAT, true))).as('days');

    console.debug("calcScoreOnDownvotePost:updateLastDownvotes -> the post is upvoted previously");

    // continue, if last_update is earlier from activity time, less than a day.
    // note: minus duration means last update is later than activity time.
    if (dayDiffLastUpdateUpvoteAndPostTime >= 0 && dayDiffLastUpdateUpvoteAndPostTime <= 1) {
      console.debug("calcScoreOnDownvotePost:updateLastDownvotes -> last_update of upvotes is earlier from activity time and less than a day");

      // continue, if earliest_time is empty or not more than 7 days earlier from activity time
      const dayDiffEarliestTimeUpvotesAndActivityTime = moment.duration(momentActivityTime.diff(moment.utc(lastUpvotes.earliest_time, REGULAR_TIME_FORMAT, true))).as('days');

      if (dayDiffEarliestTimeUpvotesAndActivityTime <= 7) {
        console.debug("calcScoreOnDownvotePost:updateLastDownvotes -> earliest_time of downvotes is less than 7 days earlier from activity time, update the counter and last update");
        lastUpvotes.last_update = activityTime;
        lastUpvotes.counter = lastUpvotes.counter - 1;
      }
    }
  }
}

const calcScoreOnDownvotePost = async(data, userScoreDoc, userScoreList, postScoreDoc, postScoreList, userPostScoreDoc, userPostScoreList) => {
  console.debug("Starting calcScoreOnDownvotePost");

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

  const timestamp = moment().utc().format(REGULAR_TIME_FORMAT);

  // add activity log if not exists yet. Assumed the activity is unique by time, it means
  // there won't be different event in the same second.
  const existingActivityLog = userPostScoreDoc.activity_log[data.activity_time];
  if (existingActivityLog) {
    console.debug("calcScoreOnDownvotePost -> skip downvote count since it already exists in the log : " + existingActivityLog);
  } else {
    userPostScoreDoc.activity_log[data.activity_time] = 'downvote';

    // check if there is anomaly of cancel downvote that happened after this time of activity,
    // then reset the anomaly of cancel downvote
    if (userPostScoreDoc.anomaly_activities.cancel_downvote_time !== "" &&
      moment.utc(userPostScoreDoc.anomaly_activities.cancel_downvote_time).diff(
        moment.utc(data.activity_time), 'seconds') > 0) {
      console.debug("calcScoreOnDownvotePost -> reset cancel downvote time");
      userPostScoreDoc.anomaly_activities.cancel_downvote_time = "";
    } else {
      if (userPostScoreDoc.downvote_count > 0) {
        // already downvoted, but downvote again ? Probably this downvote event should be happened
        // before cancel downvote. Put it in anomaly of downvote event if the anomaly is empty,
        // or current anomaly time is earlier than this activity time
        if (userPostScoreDoc.anomaly_activities.downvote_time === "" ||
          moment.utc(data.activity_time).diff(
            moment.utc(userPostScoreDoc.anomaly_activities.downvote_time), 'seconds') > 0) {
          console.debug("calcScoreOnDownvotePost -> set anomaly downvote time");
          userPostScoreDoc.anomaly_activities.downvote_time = data.activity_time;
        }
      } else {
        console.debug("calcScoreOnDownvotePost -> set downvote count = 1");

        // check whether the user previously has downvote the post.
        // If it does, then need to update several additional information regarding the downvote
        const isUpvoted = (userPostScoreDoc.downvote_count > 0);

        updateLastDownvotes(userScoreDoc, data.activity_time, isUpvoted);
        userScoreDoc.updated_at = timestamp; // format current time in utc

        // Update post-score doc:
        //    1. increment downvote point
        //    2. decrement upvote point with previous calculated upvote point, if upvoted previously
        //    3. Recalculate post score
        const D_REC = process.env.D_REC || 50.0;
        const downvotePoint = postInteractionPoint(userScoreDoc.last_downvotes.counter, D_REC);
        postScoreDoc.downvote_point = postScoreDoc.downvote_point + downvotePoint;
        if (isUpvoted) {
          postScoreDoc.upvote_point = postScoreDoc.upvote_point - userPostScoreDoc.upvote_point;
        }
        await calcPostScore(postScoreDoc);
        postScoreDoc.updated_at = timestamp; // format current time in utc

        // 5. Update user-post score doc:
        //    1. block_count = 1
        //    2. blockpoint
        //    3. Re-calculate and update the user-post score
        userPostScoreDoc.downvote_count = 1;
        userPostScoreDoc.upvote_count = 0;
        userPostScoreDoc.downvote_point = downvotePoint;

        await userScoreList.updateOne(
          { _id : userScoreDoc._id }, // query data to be updated
          { $set : {
            last_upvotes: userScoreDoc.last_upvotes,
            last_downvotes: userScoreDoc.last_downvotes,
            updated_at: userScoreDoc.updated_at,
          } }, // updates
          { upsert: false } // options
        );

        await postScoreList.updateOne(
          { _id : postScoreDoc._id }, // query data to be updated
          { $set : postScoreDoc }, // updates
          { upsert: false } // options
        );

        await updateScoreToStream(postScoreDoc);
      }
    }
  }

  userPostScoreDoc.author_id = postScoreDoc.author_id;
  userPostScoreDoc.post_score = postScoreDoc.post_score;
  await calcUserPostScore(userPostScoreDoc);
  userPostScoreDoc.updated_at = moment().utc().format(REGULAR_TIME_FORMAT); // format current time in utc

  const result = await userPostScoreList.updateOne(
    { _id : userPostScoreDoc._id }, // query data to be updated
    { $set : userPostScoreDoc }, // updates
    { upsert: true } // options
  );

  console.debug("Update on downvote post event: " + JSON.stringify(result));
  console.debug("calcScoreOnDownvotePost => user post score doc: " + JSON.stringify(userPostScoreDoc));

  return result;
};

module.exports = {
  calcScoreOnDownvotePost
}
