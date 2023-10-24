const moment = require('moment');
const {calcUserPostScore} = require('./calc-user-post-score');
const {calcPostScore} = require('./calc-post-score');
const {updateLastp3Scores} = require('./calc-user-score');
const {updateScoreToStream} = require('./update-score-to-stream');
const {postInteractionPoint} = require('../../utils');

const {updateLastUpvotesCounter, updateLastDownvotesCounter} = require('./formula/helper');

const REGULAR_TIME_FORMAT = 'YYYY-MM-DD HH:mm:ss';

/*
 * Update last upvotes information, with condition for update:
 * 1. Update the counter in userScoreDoc whenever it's make sense to update.
 *    By the mean of make sense:
 *    1. last_update is earlier from this activity time, less than a day (means this info have been updated at least from daily process)
 *    2. earliest_time is not more than 7 days earlier from this activity time. If it's more than 7 days before, surely it's not an uptodated counter.
 * 2. Updated fields:
 *    1. earliest_time --> if currently empty (it's the first time doing the activity)
 *    2. last_time --> with activity time
 *    3. last update --> with activity time
 *    4. counter --> increment 1
 * 2. Update the counter of downvotes too, if it is downvoted previously.
 */
function updateLastUpvotes(userScoreDoc, activityTime, isDownvoted) {
  updateLastUpvotesCounter(userScoreDoc, activityTime);
  if (isDownvoted) {
    updateLastDownvotesCounter(userScoreDoc, activityTime, isDownvoted);
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
const calcScoreOnUpvotePost = async (data, score) => {
  console.debug('Starting calcScoreOnUpvotePost');
  const {
    userScoreDoc,
    userScoreList,
    postScoreDoc,
    postScoreList,
    userPostScoreDoc,
    userPostScoreList,
    authorUserScoreDoc
  } = score;
  const timestamp = moment().utc().format(REGULAR_TIME_FORMAT);
  // add activity log if not exists yet. Assumed the activity is unique by time, it means
  // there won't be different event in the same second.
  const existingActivityLog = userPostScoreDoc.activity_log[data.activity_time];
  if (existingActivityLog) {
    console.debug(
      `calcScoreOnUpvotePost -> skip upvote count since it already exists in the log : ${existingActivityLog}`
    );
  } else {
    userPostScoreDoc.activity_log[data.activity_time] = 'upvote';
    // check if there is anomaly of cancel upvote that happened after this time of activity,
    // then reset the anomaly of cancel upvote
    if (
      userPostScoreDoc.anomaly_activities.cancel_upvote_time !== '' &&
      moment
        .utc(userPostScoreDoc.anomaly_activities.cancel_upvote_time)
        .diff(moment.utc(data.activity_time), 'seconds') > 0
    ) {
      console.debug('calcScoreOnUpvotePost -> reset cancel upvote time');
      userPostScoreDoc.anomaly_activities.cancel_upvote_time = '';
    } else {
      if (userPostScoreDoc.upvote_count > 0) {
        // already upvoted, but upvote again ? Probably this upvote event should be happened
        // before cancel upvote. Put it in anomaly of upvote event if the anomaly is empty,
        // or current anomaly time is earlier than this activity time
        if (
          userPostScoreDoc.anomaly_activities.upvote_time === '' ||
          moment
            .utc(data.activity_time)
            .diff(moment.utc(userPostScoreDoc.anomaly_activities.upvote_time), 'seconds') > 0
        ) {
          console.debug('calcScoreOnUpvotePost -> set anomaly upvote time');
          userPostScoreDoc.anomaly_activities.upvote_time = data.activity_time;
        }
      } else {
        console.debug('calcScoreOnUpvotePost -> set upvote count = 1');
        // check whether the user previously has downvote the post.
        // If it does, then need to update several additional information regarding the downvote
        const isDownvoted = userPostScoreDoc.downvote_count > 0;

        updateLastUpvotes(userScoreDoc, data.activity_time, isDownvoted);
        userScoreDoc.updated_at = timestamp; // format current time in utc

        // Update post-score doc:
        //    1. increment upvote point
        //    2. decrement downvote point with previous calculated downvote point, if downvoted previously
        //    3. Recalculate post score
        const upvotePoint = postInteractionPoint(userScoreDoc.last_upvotes.counter, 'upvote');
        postScoreDoc.upvote_point += upvotePoint;
        if (isDownvoted) {
          postScoreDoc.downvote_point -= userPostScoreDoc.downvote_point;
        }
        await calcPostScore(postScoreDoc);
        postScoreDoc.updated_at = timestamp; // format current time in utc

        // 5. Update user-post score doc:
        //    1. block_count = 1
        //    2. blockpoint
        //    3. Re-calculate and update the user-post score
        userPostScoreDoc.upvote_count = 1;
        userPostScoreDoc.downvote_count = 0;
        userPostScoreDoc.upvote_point = upvotePoint;
        userPostScoreDoc.last_updown = data.activity_time;

        // Update last p3 scores in user score doc
        updateLastp3Scores(authorUserScoreDoc, postScoreDoc);
        authorUserScoreDoc.updated_at = timestamp; // format current time in utc

        await Promise.all([
          userScoreList.updateOne(
            {_id: authorUserScoreDoc._id}, // query data to be updated
            {
              $set: {
                last_p3_scores: authorUserScoreDoc.last_p3_scores,
                updated_at: authorUserScoreDoc.updated_at
              }
            }, // updates
            {upsert: false} // options
          ),

          userScoreList.updateOne(
            {_id: userScoreDoc._id}, // query data to be updated
            {
              $set: {
                last_upvotes: userScoreDoc.last_upvotes,
                last_downvotes: userScoreDoc.last_downvotes,
                updated_at: userScoreDoc.updated_at
              }
            }, // updates
            {upsert: false} // options
          ),
          postScoreList.updateOne(
            {_id: postScoreDoc._id}, // query data to be updated
            {$set: postScoreDoc}, // updates
            {upsert: false} // options
          ),

          updateScoreToStream(postScoreDoc)
        ]);
      }
    }
  }

  userPostScoreDoc.author_id = postScoreDoc.author_id;
  userPostScoreDoc.post_score = postScoreDoc.post_score;
  await calcUserPostScore(userPostScoreDoc);
  userPostScoreDoc.updated_at = timestamp; // format current time in utc

  const result = await userPostScoreList.updateOne(
    {_id: userPostScoreDoc._id}, // query data to be updated
    {$set: userPostScoreDoc}, // updates
    {upsert: true} // options
  );

  console.debug(`Update on upvote post event: ${JSON.stringify(result)}`);
  console.debug(
    `calcScoreOnUpvotePost => user post score doc: ${JSON.stringify(userPostScoreDoc)}`
  );
  return result;
};

module.exports = {
  calcScoreOnUpvotePost
};
