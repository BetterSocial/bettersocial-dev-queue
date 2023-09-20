const moment = require("moment");
const { calcUserScore } = require("./calc-user-score");
const { averagePostScore } = require("../../utils");
const {
  REGULAR_TIME_FORMAT,
  EVENT_DAILY_PROCESS_USER_SCORE_PHASE2,
} = require("../scoring-constant");
const { USER_SCORE_WEIGHT } = require("./formula/constant");
const UsersFunction = require("../../databases/functions/users");

const scoringProcessQueue = require("../../queues/queueSenderForRedis"); // uncomment this line if using redis as message queue server
// const scoringProcessQueue = require("../../queues/queueSenderForKafka"); // uncomment this line if using kafka as message queue server

const updateUserScoreOnDailyProcessPhase1 = async (
  job,
  userScoreCol,
  processTime,
  userIds,
  lastBatch
) => {
  console.debug("Starting updateUserScoreOnDailyProcessPhase1");

  // get complete doc from the db, by given user ids
  const cursors = await userScoreCol.find({ _id: { $in: userIds } });

  // calculate percentage per document. It's going to be used for updating job's progress
  const progressPerDoc = Math.floor(100 / userIds.length);
  let counter = 0;

  let userDoc;
  const updatedDocs = [];
  while (await cursors.hasNext()) {
    counter++;
    userDoc = await cursors.next();

    // update r score, but first need to get sum of p3 score
    let totalPostScores = 0;
    const lastp3Scores = userDoc.last_p3_scores;
    for (key in lastp3Scores) {
      if (
        key !== "_count" &&
        key !== "_earliest_post_time" &&
        key !== "_earliest_post_id"
      ) {
        totalPostScores += lastp3Scores[key].p3_score;
      }
    }
    userDoc.r_score = averagePostScore(totalPostScores, lastp3Scores._count);

    // update following
    userDoc.USER_SCORE_WEIGHT = USER_SCORE_WEIGHT;
    const userFollower = await UsersFunction.getUserFollowerList(userDoc._id);
    userDoc.following = userFollower;
    userDoc.F_score_update = userFollower.length;

    // Update values from up-to-dated fields into daily-updated field
    userDoc.F_score = userDoc.F_score_update;
    userDoc.sum_BP_score = userDoc.sum_BP_score_update;
    userDoc.sum_impr_score = userDoc.sum_impr_score_update;

    await calcUserScore(userDoc);
    userDoc.last_daily_process = processTime;
    userDoc.updated_at = moment().utc().format(REGULAR_TIME_FORMAT);

    updatedDocs.push({
      updateOne: {
        filter: { _id: userDoc._id }, // query data to be updated
        update: { $set: userDoc }, // updates
        upsert: false,
      },
    });

    // update job progress
    job.progress(counter * progressPerDoc);
  }

  // Push the updated docs to db
  const result = userScoreCol.bulkWrite(updatedDocs);

  // If this batch is flagged as last batch, then send queue to starting the phase 2
  if (lastBatch) {
    sendQueue(processTime);
  }

  console.debug(
    "Done updateUserScoreOnDailyProcessPhase1, with result: ",
    result
  );

  return result;
};

function sendQueue(processTime) {
  // sending queue for scoring process on follow user event
  const scoringProcessData = {
    process_time: processTime,
  };
  scoringProcessQueue.sendQueueForDailyProcess(
    EVENT_DAILY_PROCESS_USER_SCORE_PHASE2,
    scoringProcessData
  );
}

module.exports = {
  updateUserScoreOnDailyProcessPhase1,
};
