const moment = require('moment');
const {calcUserPostScore} = require('./calc-user-post-score');
const {calcPostScore} = require('./calc-post-score');
const {updateLastp3Scores} = require('./calc-user-score');
const {updateScoreToStream} = require('./update-score-to-stream');
const {isStringBlankOrNull, postInteractionPoint} = require('../../utils');

const REGULAR_TIME_FORMAT = 'YYYY-MM-DD HH:mm:ss';

/*
 * Update last blocks information, with condition for update:
 * 1. Update the counter in userScoreDoc whenever it's make sense to update.
 *    By the mean of make sense:
 *    1. last_update is earlier from this activity time, less than a day (means this info have been updated at least from daily process)
 *    2. earliest_time is not more than 7 days earlier from this activity time. If it's more than 7 days before, surely it's not an uptodated counter.
 * 2. Updated fields:
 *    1. earliest_time --> if currently empty (it's the first time doing the activity)
 *    2. last_time --> with activity time
 *    3. last update --> with activity time
 *    4. counter --> increment 1
 */
function updateLastBlocks(lastBlocks, activityTime) {
  // Get the activity time in moment object, so it would be easier to count the difference between times.
  const momentActivityTime = moment.utc(activityTime, REGULAR_TIME_FORMAT, true);

  if (!isStringBlankOrNull(lastBlocks.last_update)) {
    const dayDiffLastUpdateAndPostTime = moment
      .duration(
        momentActivityTime.diff(moment.utc(lastBlocks.last_update, REGULAR_TIME_FORMAT, true))
      )
      .as('days');

    console.debug('calcScoreOnBlockUserPost:updateLastBlocks -> there is last blocks data');

    // continue, if last_update is earlier from activity time, less than a day.
    // note: minus duration means last update is later than activity time.
    if (dayDiffLastUpdateAndPostTime >= 0 && dayDiffLastUpdateAndPostTime <= 1) {
      console.debug(
        'calcScoreOnBlockUserPost:updateLastBlocks -> last_update is earlier from activity time and less than a day'
      );

      // continue, if earliest_time is empty or not more than 7 days earlier from activity time
      let isUpdate = true;
      if (!isStringBlankOrNull(lastBlocks.earliest_time)) {
        const dayDiffEarliestTimeAndActivityTime = moment
          .duration(
            momentActivityTime.diff(moment.utc(lastBlocks.earliest_time, REGULAR_TIME_FORMAT, true))
          )
          .as('days');

        if (dayDiffEarliestTimeAndActivityTime > 7) {
          console.debug(
            'calcScoreOnBlockUserPost:updateLastBlocks -> earliest_time is more than 7 days earlier from activity time'
          );
          isUpdate = false;
        }
      } else {
        console.debug('updateBlockerUserDoc: earliest_time is empty');
        lastBlocks.earliest_time = activityTime;
      }

      if (isUpdate) {
        const currentCount = lastBlocks.counter;

        console.debug('updateBlockerUserDoc: update the counter');
        lastBlocks.last_update = activityTime;
        lastBlocks.last_time = activityTime;
        lastBlocks.counter = currentCount + 1;
      }
    }
  }
}

/*
 * 1. Has author user score doc, but don't have post score doc --> user blocking without post reference
 *    1. Check whether the user has blocked the author (possible reprocess), by looking at the blocking list in user score doc.
 *       If yes, then skip the process,
 *       there's nothing we should do, it just a reprocess. If no, then continue the process
 *    2. Update user-score doc of the blocker:
 *       1. Last blocks information
 *       2. Delete following of the author (if exists)
 *       3. Add the author in blocking list
 */
async function calcScoreOnBlockUser(data, userScoreDoc, authorUserScoreDoc, userScoreList) {
  // Check whether the user has blocked the author (possible reprocess), by looking at the blocking list in user score doc
  let result = null;
  if (userScoreDoc.blocking && userScoreDoc.blocking.indexOf(authorUserScoreDoc._id) > -1) {
    console.debug(`User ${authorUserScoreDoc._id} already blocked by user ${userScoreDoc._id}`);
  } else {
    console.debug(`Adding user ${authorUserScoreDoc._id} as blocked by user ${userScoreDoc._id}`);

    const timestamp = moment().utc().format(REGULAR_TIME_FORMAT);

    // 1. Update Last blocks information
    updateLastBlocks(userScoreDoc.last_blocks, data.activity_time);

    // 2. Delete following of the author (if exists)
    const followingIndex = userScoreDoc.following.indexOf(authorUserScoreDoc._id);
    const updateUserScoreDocs = [];
    if (followingIndex > -1) {
      userScoreDoc.following.splice(followingIndex);

      authorUserScoreDoc.F_score_update -= 1;
      authorUserScoreDoc.updated_at = timestamp;
    }

    // Update author following and block data
    authorUserScoreDoc.sum_BP_score_update += 1;
    updateUserScoreDocs.push({
      updateOne: {
        filter: {_id: authorUserScoreDoc._id}, // query data to be updated
        update: {
          $set: {
            F_score_update: authorUserScoreDoc.F_score_update,
            sum_BP_score_update: authorUserScoreDoc.sum_BP_score_update,
            updated_at: authorUserScoreDoc.updated_at
          }
        }, // updates
        upsert: false
      }
    });

    // 3. Add the author in blocking list
    userScoreDoc.blocking.push(authorUserScoreDoc._id);
    userScoreDoc.updated_at = timestamp;

    updateUserScoreDocs.push({
      updateOne: {
        filter: {_id: userScoreDoc._id}, // query data to be updated
        update: {
          $set: {
            last_blocks: userScoreDoc.last_blocks,
            following: userScoreDoc.following,
            blocking: userScoreDoc.blocking,
            updated_at: userScoreDoc.updated_at
          }
        }, // updates
        upsert: false
      }
    });

    result = await userScoreList.bulkWrite(updateUserScoreDocs);
  }
  return result;
}

/*
 * 3. Has author user score doc and post score doc:
 *    1. Check whether the activity has been recorded (possible reprocess), by looking at the activity log in user-post score doc.
 *       If yes, then skip the process,
 *       there's nothing we should do, it just a reprocess. If no, then continue the process
 *    2. Check whether the post already been blocked (possible race condition with the unblock request or block multiple times [still can do it in apps by the time this written] ).
 *       If it has been blocked, then stop.
 *    3. Check whether the user has blocked the author (possible reprocess or block multiple time or multiple post), by looking at the blocking list in user score doc.
 *       If no, then:
 *       1. Update user-score doc of the blocker:
 *          1. Last blocks information
 *          2. Delete following of the author (if exists), for non anonymous post
 *          3. Add the author in blocking list, for non anonymous post
 *       2. Calculate blockpoint of the blocker
 *       3. Update user-score doc of the author--> no need, it will get updated daily
 *       4. Update post-score doc:
 *          1. "BP Score"
 *          2. Recalculate post score
 *       5. Update user-post score doc:
 *          1. block_count = 1
 *          2. blockpoint
 *          3. Re-calculate and update the user-post score
 */

async function blockedByUser(userScoreDoc, authorUserScoreDoc) {
  // Check whether the user has blocked the author (possible reprocess), by looking at the blocking list in user score doc
  if (userScoreDoc.blocking && userScoreDoc.blocking.indexOf(authorUserScoreDoc._id) > -1) {
    console.debug(`User ${authorUserScoreDoc._id} already blocked by user ${userScoreDoc._id}`);
    return true;
  }
  return false;
}
async function handleAnomalyActivities(userPostScoreDoc, data) {
  // Put it in anomaly of block event if the anomaly is empty,
  // or current anomaly time is earlier than this activity time
  if (
    userPostScoreDoc.anomaly_activities.block_time === '' ||
    moment
      .utc(data.activity_time)
      .diff(moment.utc(userPostScoreDoc.anomaly_activities.block_time), 'seconds') > 0
  ) {
    console.debug('calcScoreOnBlockUserPost:calcScoreOnBlockPost -> set anomaly block time');
    userPostScoreDoc.anomaly_activities.block_time = data.activity_time;
  }
}
async function calcScoreOnBlockPost(
  data,
  userScoreDoc,
  authorUserScoreDoc,
  postScoreDoc,
  userPostScoreDoc,
  connectionList
) {
  userPostScoreDoc.activity_log[data.activity_time] = 'block';
  // 2. Check whether the post already been blocked (possible race condition with the unblock request).
  //    If it has been blocked, then update the anomaly activities of block, then stop.
  if (userPostScoreDoc.block_count > 0) {
    await handleAnomalyActivities(userPostScoreDoc, data);
  } else {
    console.debug('calcScoreOnBlockUserPost:calcScoreOnBlockPost -> not yet blocked, set values');

    const timestamp = moment().utc().format(REGULAR_TIME_FORMAT);
    if (!postScoreDoc.anonimity && !(await blockedByUser(userScoreDoc, authorUserScoreDoc))) {
      console.debug(`Adding user ${authorUserScoreDoc._id} as blocked by user ${userScoreDoc._id}`);
      // 2. Delete following of the author (if exists)
      const followingIndex = userScoreDoc.following.indexOf(authorUserScoreDoc._id);
      if (followingIndex > -1) {
        userScoreDoc.following.splice(followingIndex);

        authorUserScoreDoc.F_score_update -= 1;
      }
      // 3. Add the author in blocking list
      userScoreDoc.blocking.push(authorUserScoreDoc._id);
    }

    // 4. Update user-score doc of the blocker:
    //    1. Last blocks information
    updateLastBlocks(userScoreDoc.last_blocks, data.activity_time);
    userScoreDoc.updated_at = timestamp; // format current time in utc

    // 5. Update post-score doc:
    //    1. "BP Score"
    //    2. Recalculate post score
    const blockPoint = postInteractionPoint(userScoreDoc.last_blocks.counter, 'block');
    postScoreDoc.BP_score += blockPoint;
    await calcPostScore(postScoreDoc);
    postScoreDoc.updated_at = timestamp; // format current time in utc

    // 5. Update user-post score doc:
    //    1. block_count = 1
    //    2. blockpoint
    //    3. Re-calculate and update the user-post score
    userPostScoreDoc.block_count = 1;
    userPostScoreDoc.block_point = blockPoint;
    userPostScoreDoc.last_block = data.activity_time;
    await calcUserPostScore(userPostScoreDoc);
    userPostScoreDoc.updated_at = timestamp; // format current time in utc

    // Update last p3 scores in user score doc
    updateLastp3Scores(authorUserScoreDoc, postScoreDoc);
    authorUserScoreDoc.sum_BP_score_update += blockPoint;
    authorUserScoreDoc.updated_at = timestamp; // format current time in utc

    const updateUserScoreDocs = [];
    updateUserScoreDocs.push({
      updateOne: {
        filter: {_id: authorUserScoreDoc._id}, // query data to be updated
        update: {
          $set: {
            F_score_update: authorUserScoreDoc.F_score_update,
            sum_BP_score_update: authorUserScoreDoc.sum_BP_score_update,
            last_p3_scores: authorUserScoreDoc.last_p3_scores,
            updated_at: authorUserScoreDoc.updated_at
          }
        }, // updates
        upsert: false
      }
    });

    updateUserScoreDocs.push({
      updateOne: {
        filter: {_id: userScoreDoc._id}, // query data to be updated
        update: {
          $set: {
            last_blocks: userScoreDoc.last_blocks,
            following: userScoreDoc.following,
            blocking: userScoreDoc.blocking,
            updated_at: userScoreDoc.updated_at
          }
        }, // updates
        upsert: false
      }
    });

    await connectionList.userScoreList.bulkWrite(updateUserScoreDocs);

    await connectionList.postScoreList.updateOne(
      {_id: postScoreDoc._id}, // query data to be updated
      {$set: postScoreDoc}, // updates
      {upsert: false} // options
    );

    const result = await connectionList.userPostScoreList.updateOne(
      {_id: userPostScoreDoc._id}, // query data to be updated
      {$set: userPostScoreDoc}, // updates
      {upsert: true} // options
    );

    console.debug(`Update on block post event: ${JSON.stringify(result)}`);
    console.debug(
      `calcScoreOnBlockPost => user post score doc: ${JSON.stringify(userPostScoreDoc)}`
    );

    await updateScoreToStream(postScoreDoc);
  }
}

const calcScoreOnBlockUserPost = async (
  data,
  userScoreDoc,
  authorUserScoreDoc,
  postScoreDoc,
  userPostScoreDoc,
  connectionList
) => {
  console.debug('Starting calcScoreOnBlockUserPost');

  /*
   * There are 3 possibilities regarding author user score doc and post score doc:
   * 1. Has author user score doc, but don't have post score doc --> user blocking without post reference
   *    1. Check whether the user has blocked the author (possible reprocess), by looking at the blocking list in user score doc.
   *       If yes, then skip the process,
   *       there's nothing we should do, it just a reprocess. If no, then continue the process
   *    2. Update user-score doc of the blocker:
   *       1. Last blocks information
   *       2. Delete following of the author (if exists)
   *       3. Add the author in blocking list
   * 2. Has post score doc, but don't have author user score doc --> user blocking the anonymous post.
   *    --> discussed with Bastian, it have the same behavior with block of regular post
   * 3. Has author user score doc and post score doc:
   *    1. Check whether the activity has been recorded (possible reprocess), by looking at the activity log in user-post score doc.
   *       If yes, then skip the process,
   *       there's nothing we should do, it just a reprocess. If no, then continue the process
   *    2. Check whether the post already been blocked (possible race condition with the unblock request or block multiple times [still can do it in apps by the time this written] ).
   *       If it has been blocked, then stop.
   *    3. Check whether the user has blocked the author (possible reprocess or block multiple time or multiple post), by looking at the blocking list in user score doc.
   *       If no, then:
   *       1. Update user-score doc of the blocker:
   *          1. Last blocks information
   *          2. Delete following of the author (if exists)
   *          3. Add the author in blocking list
   *       2. Calculate blockpoint of the blocker
   *       3. Update user-score doc of the author:
   *          1. "Sum BP Score"
   *          2. Recalculate user score
   *       4. Update post-score doc:
   *          1. "BP Score"
   *          2. Recalculate post score
   *       5. Update user-post score doc:
   *          1. block_count = 1
   *          2. blockpoint
   *          3. Re-calculate and update the user-post score
   */

  // handle the calculation based on condition
  let result;
  if (!postScoreDoc) {
    console.debug('calcScoreOnBlockUserPost -> block user without post reference');
    result = await calcScoreOnBlockUser(
      data,
      userScoreDoc,
      authorUserScoreDoc,
      connectionList.userScoreList
    );
  } else {
    console.debug('calcScoreOnBlockUserPost -> block user with post reference');
    // Check whether the activity has been recorded (possible reprocess), by looking at the activity log in user-post score doc.
    const existingActivityLog = userPostScoreDoc.activity_log[data.activity_time];
    if (existingActivityLog) {
      console.debug(
        `calcScoreOnBlockUserPost:calcScoreOnBlockPost -> skip block process since it already exists in the log : ${existingActivityLog}`
      );
    } else {
      result = await calcScoreOnBlockPost(
        data,
        userScoreDoc,
        authorUserScoreDoc,
        postScoreDoc,
        userPostScoreDoc,
        connectionList
      );
    }
  }

  return result;
};

module.exports = {
  calcScoreOnBlockUserPost
};
