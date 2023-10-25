const moment = require('moment');
const {isStringBlankOrNull} = require('../../../utils');
const {updateScoreToStream} = require('../update-score-to-stream');

const REGULAR_TIME_FORMAT = 'YYYY-MM-DD HH:mm:ss';

const getDayDiffActivity = (activityTime, lastActivity) => {
  // Get the activity time in moment object, so it would be easier to count the difference between times.
  const momentActivityTime = moment.utc(activityTime, REGULAR_TIME_FORMAT, true);
  return moment
    .duration(momentActivityTime.diff(moment.utc(lastActivity, REGULAR_TIME_FORMAT, true)))
    .as('days');
};

const updateLastUpvotesCounter = (userScoreDoc, activityTime, cancelUpvote = false) => {
  const lastUpvotes = userScoreDoc.last_upvotes;
  if (isStringBlankOrNull(lastUpvotes.last_update)) {
    return;
  }

  const dayDiffLastUpdateAndPostTime = getDayDiffActivity(activityTime, lastUpvotes.last_update);
  console.debug(
    `getDayDiffActivity(activityTime=${activityTime}, lastUpvotes.last_update=${lastUpvotes.last_update})`
  );
  console.debug(`dayDiffLastUpdateAndPostTime => ${dayDiffLastUpdateAndPostTime}`);

  // continue, if last_update is earlier from activity time, less than a day.
  // note: minus duration means last update is later than activity time.
  if (dayDiffLastUpdateAndPostTime >= 0 && dayDiffLastUpdateAndPostTime <= 1) {
    console.debug(
      'calcScoreOnUpvotePost:updateLastUpvotes -> last_update is earlier from activity time and less than a day'
    );

    // continue, if earliest_time is empty or not more than 7 days earlier from activity time
    let isUpdate = true;
    if (!isStringBlankOrNull(lastUpvotes.earliest_time)) {
      const dayDiffEarliestTimeAndActivityTime = getDayDiffActivity(
        activityTime,
        lastUpvotes.earliest_time
      );
      if (cancelUpvote && dayDiffEarliestTimeAndActivityTime <= 7) {
        lastUpvotes.last_update = activityTime;
        lastUpvotes.counter -= 1;
        isUpdate = false;
      } else if (dayDiffEarliestTimeAndActivityTime > 7) {
        console.debug(
          'calcScoreOnUpvotePost:updateLastUpvotes -> earliest_time is more than 7 days earlier from activity time'
        );
        isUpdate = false;
      }
    } else {
      console.debug('calcScoreOnUpvotePost:updateLastUpvotes -> earliest_time is empty');
      lastUpvotes.earliest_time = activityTime;
    }

    if (isUpdate) {
      const currentCount = lastUpvotes.counter;

      console.debug('calcScoreOnUpvotePost:updateLastUpvotes -> update the counter');
      lastUpvotes.last_update = activityTime;
      lastUpvotes.last_time = activityTime;
      lastUpvotes.counter = currentCount + 1;
    }
  }
};

const updateLastDownvotesCounter = (userScoreDoc, activityTime) => {
  const lastDownvotes = userScoreDoc.last_downvotes;
  const dayDiffLastUpdateDownvoteAndPostTime = getDayDiffActivity(
    activityTime,
    lastDownvotes.last_update
  );

  console.debug('calcScoreOnUpvotePost:updateLastUpvotes -> the post is downvoted previously');

  // continue, if last_update is earlier from activity time, less than a day.
  // note: minus duration means last update is later than activity time.
  if (dayDiffLastUpdateDownvoteAndPostTime >= 0 && dayDiffLastUpdateDownvoteAndPostTime <= 1) {
    console.debug(
      'calcScoreOnUpvotePost:updateLastUpvotes -> last_update of downvotes is earlier from activity time and less than a day'
    );

    // continue, if earliest_time is empty or not more than 7 days earlier from activity time
    const dayDiffEarliestTimeDownvotesAndActivityTime = getDayDiffActivity(
      activityTime,
      lastDownvotes.earliest_time
    );

    if (dayDiffEarliestTimeDownvotesAndActivityTime <= 7) {
      console.debug(
        'calcScoreOnUpvotePost:updateLastUpvotes -> earliest_time of downvotes is less than 7 days earlier from activity time, update the counter and last update'
      );
      lastDownvotes.last_update = activityTime;
      lastDownvotes.counter -= 1;
    }
  }
};

const updateCollection = async (
  userScoreList,
  postScoreList,
  authorUserScoreDoc,
  userScoreDoc,
  postScoreDoc
) => {
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
};

module.exports = {
  updateLastUpvotesCounter,
  updateLastDownvotesCounter,
  updateCollection
};
