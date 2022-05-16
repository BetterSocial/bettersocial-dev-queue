const moment = require("moment");
const {
  EVENT_DAILY_PROCESS_USER_SCORE_PHASE1,
  REGULAR_TIME_FORMAT,
  POST_TIME_FORMAT,
} = require("../scoring-constant");

const scoringProcessQueue = require("../../queues/queueSenderForRedis"); // uncomment this line if using redis as message queue server
//const scoringProcessQueue = require("../../queues/queueSenderForKafka"); // uncomment this line if using kafka as message queue server

const batchSize = process.env.SCORING_DAILY_PROCESS_BATCH_SIZE;

/*
 * Trigger user score daily process
 */
const triggerUserScoreDailyProcess = async(userScoreCol) => {
  console.debug("Starting triggerUserScoreDailyProcess");

  const processTime = moment.utc().format(REGULAR_TIME_FORMAT);

  // get all user ids
  const cursors = userScoreCol.find();

  let result;
  let counter = 0;
  let userIds = [];
  while (await cursors.hasNext()) {

    result = await cursors.next();
    userIds.push(result._id);

    counter++;

    if (counter >= batchSize) {
      //console.log("Batch size limit");
      if (await cursors.hasNext()) {
        //console.log("Sending queue");
        sendQueueUserScorePhase1(userIds, processTime, false);
      } else {
        //console.log("Sending queue for last batch");
        sendQueueUserScorePhase1(userIds, processTime, true);
      }

      counter = 0;
      userIds = [];
    }
  }

  // send the last batch of the user ids
  if (userIds.length !== 0) {
    //console.log("Sending queue for last batch outside loop");
    sendQueueUserScorePhase1(userIds, processTime, true);
  }
}

function sendQueueUserScorePhase1(userIds, processTime, lastBatch) {
  // sending queue for scoring process on follow user event
  const scoringProcessData = {
    process_time: processTime,
    user_ids: userIds,
    last_batch: lastBatch,
  };
  scoringProcessQueue.sendQueueForDailyProcess(EVENT_DAILY_PROCESS_USER_SCORE_PHASE1, scoringProcessData);
}

module.exports = {
  triggerUserScoreDailyProcess,
}
