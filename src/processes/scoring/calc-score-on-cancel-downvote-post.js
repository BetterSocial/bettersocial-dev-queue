require("dotenv").config;
const moment = require("moment");
const { calcUserPostScore } = require("./calc-user-post-score");
const { calcPostScore } = require("./calc-post-score");
const { updateLastp3Scores } = require("./calc-user-score");
const { updateScoreToStream } = require("./update-score-to-stream");
const { isStringBlankOrNull } = require("../../utils");
const REGULAR_TIME_FORMAT = "YYYY-MM-DD HH:mm:ss";

/*
 * Update last downvotes information, with condition for update:
 * 1. Update the counter in userScoreDoc whenever it's make sense to update.
 *    By the mean of make sense:
 *    1. last_update is earlier from this activity time, less than a day (means this info have been updated at least from daily process)
 *    2. earliest_time is not more than 7 days earlier from this activity time. If it's more than 7 days before, surely it's not an uptodated counter.
 * 2. Updated fields:
 *    1. last update --> with activity time
 *    2. counter --> increment 1
 */
function updateLastDownvotes(lastDownvotes, activityTime) {
  // Get the activity time in moment object, so it would be easier to count the difference between times.
  const momentActivityTime = moment.utc(
    activityTime,
    REGULAR_TIME_FORMAT,
    true
  );

  if (!isStringBlankOrNull(lastDownvotes.last_update)) {
    const dayDiffLastUpdateAndPostTime = moment
      .duration(
        momentActivityTime.diff(
          moment.utc(lastDownvotes.last_update, REGULAR_TIME_FORMAT, true)
        )
      )
      .as("days");

    console.debug(
      "calcScoreOnCancelDownvotePost:updateLastDownvotes -> there is last blocks data"
    );

    // continue, if last_update is earlier from activity time, less than a day.
    // note: minus duration means last update is later than activity time.
    if (
      dayDiffLastUpdateAndPostTime >= 0 &&
      dayDiffLastUpdateAndPostTime <= 1
    ) {
      console.debug(
        "calcScoreOnCancelDownvotePost:updateLastDownvotes -> last_update is earlier from activity time and less than a day"
      );

      // continue, if earliest_time is empty or not more than 7 days earlier from activity time
      let isUpdate = true;
      if (!isStringBlankOrNull(lastDownvotes.earliest_time)) {
        const dayDiffEarliestTimeAndActivityTime = moment
          .duration(
            momentActivityTime.diff(
              moment.utc(lastDownvotes.earliest_time, REGULAR_TIME_FORMAT, true)
            )
          )
          .as("days");

        if (dayDiffEarliestTimeAndActivityTime <= 7) {
          console.debug(
            "calcScoreOnCancelDownvotePost:updateLastDownvotes -> earliest_time is less than or equals 7 days earlier from activity time"
          );

          lastDownvotes.last_update = activityTime;
          lastDownvotes.counter = lastDownvotes.counter - 1;
        }
      }
    }
  }
}

/**
 * @typedef Score
 * @property {*} userScoreDoc
 * @property {*} userScoreList
 * @property {*} postScoreDoc
 * @property {*} postScoreList
 * @property {*} userPostScoreDoc
 * @property {*} userPostScoreList
 * @property {*} authorUserScoreDoc
 */
/**
 *
 * @param {*} data
 * @param {Score} score
 * @returns
 */
const calcScoreOnCancelDownvotePost = async (data, score) => {
  console.debug("Starting calcScoreOnCancelDownvotePost");

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
  const {
    userScoreDoc,
    userScoreList,
    postScoreDoc,
    postScoreList,
    userPostScoreDoc,
    userPostScoreList,
    authorUserScoreDoc,
  } = score;
  const timestamp = moment().utc().format(REGULAR_TIME_FORMAT);

  // add activity log if not exists yet. Assumed the activity is unique by time, it means
  // there won't be different event in the same second.
  const existingActivityLog = userPostScoreDoc.activity_log[data.activity_time];
  if (existingActivityLog) {
    console.debug(
      "calcScoreOnCancelDownvotePost -> skip reset downvote count since it already exists in the log : " +
        existingActivityLog
    );
  } else {
    userPostScoreDoc.activity_log[data.activity_time] = "cancel-downvote";

    // check if there is anomaly of downvote that happened after this time of activity,
    // then reset the anomaly of downvote
    if (
      userPostScoreDoc.anomaly_activities.downvote_time !== "" &&
      moment
        .utc(userPostScoreDoc.anomaly_activities.downvote_time)
        .diff(moment.utc(data.activity_time), "seconds") > 0
    ) {
      console.debug("calcScoreOnCancelDownvotePost -> reset downvote time");
      userPostScoreDoc.anomaly_activities.downvote_time = "";
    } else {
      if (userPostScoreDoc.downvote_count == 0) {
        // not yet downvoted, but cancel downvote ? Probably this cancel downvote event should be happened
        // after downvote. Put it in anomaly of cancel downvote event if the anomaly is empty,
        // or current anomaly time is earlier than this activity time
        if (
          userPostScoreDoc.anomaly_activities.cancel_downvote_time === "" ||
          moment
            .utc(data.activity_time)
            .diff(
              moment.utc(
                userPostScoreDoc.anomaly_activities.cancel_downvote_time
              ),
              "seconds"
            ) > 0
        ) {
          console.debug(
            "calcScoreOnCancelDownvotePost -> set anomaly cancel downvote time"
          );
          userPostScoreDoc.anomaly_activities.cancel_downvote_time =
            data.activity_time;
        }
      } else {
        console.debug(
          "calcScoreOnCancelDownvotePost -> set downvote count = 0"
        );

        updateLastDownvotes(userScoreDoc.last_downvotes, data.activity_time);
        userScoreDoc.updated_at = timestamp; // format current time in utc

        // Update post-score doc:
        //    1. increment downvote point
        //    2. decrement upvote point with previous calculated upvote point, if upvoted previously
        //    3. Recalculate post score
        const downvotePoint = userPostScoreDoc.downvote_point; // get latest upvote point from user-post score doc
        postScoreDoc.downvote_point =
          postScoreDoc.downvote_point - downvotePoint;
        await calcPostScore(postScoreDoc);
        postScoreDoc.updated_at = timestamp; // format current time in utc

        // 5. Update user-post score doc:
        //    1. downvote_count = 0
        //    2. Re-calculate and update the user-post score
        userPostScoreDoc.downvote_count = 0;
        userPostScoreDoc.last_updown = "";

        // Update last p3 scores in user score doc
        updateLastp3Scores(authorUserScoreDoc, postScoreDoc);
        authorUserScoreDoc.updated_at = timestamp; // format current time in utc

        await Promise.all([
          userScoreList.updateOne(
            { _id: authorUserScoreDoc._id }, // query data to be updated
            {
              $set: {
                last_p3_scores: authorUserScoreDoc.last_p3_scores,
                updated_at: authorUserScoreDoc.updated_at,
              },
            }, // updates
            { upsert: false } // options
          ),

          userScoreList.updateOne(
            { _id: userScoreDoc._id }, // query data to be updated
            {
              $set: {
                last_downvotes: userScoreDoc.last_downvotes,
                updated_at: userScoreDoc.updated_at,
              },
            }, // updates
            { upsert: false } // options
          ),

          postScoreList.updateOne(
            { _id: postScoreDoc._id }, // query data to be updated
            { $set: postScoreDoc }, // updates
            { upsert: false } // options
          ),

          updateScoreToStream(postScoreDoc),
        ]);
      }
    }
  }

  userPostScoreDoc.author_id = postScoreDoc.author_id;
  userPostScoreDoc.post_score = postScoreDoc.post_score;
  await calcUserPostScore(userPostScoreDoc);
  userPostScoreDoc.updated_at = moment().utc().format(REGULAR_TIME_FORMAT); // format current time in utc

  const result = await userPostScoreList.updateOne(
    { _id: userPostScoreDoc._id }, // query data to be updated
    { $set: userPostScoreDoc }, // updates
    { upsert: true } // options
  );

  console.debug(
    "Update on cancel downvote post event: " + JSON.stringify(result)
  );
  console.debug(
    "calcScoreOnCancelDownvotePost => user post score doc: " +
      JSON.stringify(userPostScoreDoc)
  );

  return result;
};

module.exports = {
  calcScoreOnCancelDownvotePost,
};
