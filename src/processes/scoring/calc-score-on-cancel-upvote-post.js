require('dotenv').config();
const moment = require('moment');
const {calcUserPostScore} = require('./calc-user-post-score');
const {calcPostScore} = require('./calc-post-score');
const {updateLastp3Scores} = require('./calc-user-score');
const {updateLastUpvotesCounter, updateCollection} = require('./formula/helper');

const REGULAR_TIME_FORMAT = 'YYYY-MM-DD HH:mm:ss';

const handleCancelUpvotePost = async (
  userScoreList,
  postScoreList,
  userScoreDoc,
  postScoreDoc,
  userPostScoreDoc,
  authorUserScoreDoc,
  data,
  timestamp
) => {
  if (
    userPostScoreDoc.upvote_count === 0 &&
    (userPostScoreDoc.anomaly_activities.cancel_upvote_time === '' ||
      moment
        .utc(data.activity_time)
        .diff(moment.utc(userPostScoreDoc.anomaly_activities.cancel_upvote_time), 'seconds') > 0)
  ) {
    // not yet upvoted, but cancel upvote ? Probably this cancel upvote event should be happened
    // after upvote. Put it in anomaly of cancel upvote event if the anomaly is empty,
    // or current anomaly time is earlier than this activity time
    console.debug('calcScoreOnCancelUpvotePost -> set anomaly cancel upvote time');
    userPostScoreDoc.anomaly_activities.cancel_upvote_time = data.activity_time;
  } else {
    console.debug('calcScoreOnCancelUpvotePost -> set upvote count = 0');

    updateLastUpvotesCounter(userScoreDoc, data.activity_time, true);
    userScoreDoc.updated_at = timestamp; // format current time in utc

    // Update post-score doc:
    //    1. increment upvote point
    //    2. decrement downvote point with previous calculated downvote point, if downvoted previously
    //    3. Recalculate post score
    const upvotePoint = userPostScoreDoc.upvote_point; // get latest upvote point from user-post score doc
    postScoreDoc.upvote_point -= upvotePoint;
    await calcPostScore(postScoreDoc);
    postScoreDoc.updated_at = timestamp; // format current time in utc

    // 5. Update user-post score doc:
    //    1. upvote_count = 0
    //    2. Re-calculate and update the user-post score
    userPostScoreDoc.upvote_count = 0;
    userPostScoreDoc.last_updown = '';

    // Update last p3 scores in user score doc
    updateLastp3Scores(authorUserScoreDoc, postScoreDoc);
    authorUserScoreDoc.updated_at = timestamp; // format current time in utc

    await updateCollection(
      userScoreList,
      postScoreList,
      authorUserScoreDoc,
      userScoreDoc,
      postScoreDoc
    );
  }
};

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
const calcScoreOnCancelUpvotePost = async (data, score) => {
  console.debug('Starting calcScoreOnCancelUpvotePost');
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
      `calcScoreOnCancelUpvotePost -> skip reset upvote count since it already exists in the log : ${existingActivityLog}`
    );
  } else {
    userPostScoreDoc.activity_log[data.activity_time] = 'cancel-upvote';

    // check if there is anomaly of upvote that happened after this time of activity,
    // then reset the anomaly of upvote
    if (
      userPostScoreDoc.anomaly_activities.upvote_time !== '' &&
      moment
        .utc(userPostScoreDoc.anomaly_activities.upvote_time)
        .diff(moment.utc(data.activity_time), 'seconds') > 0
    ) {
      console.debug('calcScoreOnCancelUpvotePost -> reset upvote time');
      userPostScoreDoc.anomaly_activities.upvote_time = '';
    } else {
      await handleCancelUpvotePost(
        userScoreList,
        postScoreList,
        userScoreDoc,
        postScoreDoc,
        userPostScoreDoc,
        authorUserScoreDoc,
        data,
        timestamp
      );
    }
  }

  userPostScoreDoc.author_id = postScoreDoc.author_id;
  userPostScoreDoc.post_score = postScoreDoc.post_score;
  await calcUserPostScore(userPostScoreDoc);
  userPostScoreDoc.updated_at = moment().utc().format(REGULAR_TIME_FORMAT); // format current time in utc

  const result = await userPostScoreList.updateOne(
    {_id: userPostScoreDoc._id}, // query data to be updated
    {$set: userPostScoreDoc}, // updates
    {upsert: true} // options
  );

  console.debug(`Update on cancel upvote post event: ${JSON.stringify(result)}`);
  console.debug(
    `calcScoreOnCancelUpvotePost => user post score doc: ${JSON.stringify(userPostScoreDoc)}`
  );

  return result;
};

module.exports = {
  calcScoreOnCancelUpvotePost
};
