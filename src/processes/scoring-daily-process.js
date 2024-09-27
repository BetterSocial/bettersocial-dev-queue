const {getDb} = require('../config/mongodb_conn');
const {
  DB_COLLECTION_USER_SCORE,
  DB_COLLECTION_POST_SCORE,
  EVENT_DAILY_PROCESS_TRIGGER,
  EVENT_DAILY_PROCESS_USER_SCORE_PHASE1,
  EVENT_DAILY_PROCESS_USER_SCORE_PHASE2,
  EVENT_DAILY_PROCESS_POST_SCORE
} = require('./scoring-constant');
const {
  updateUserScoreOnDailyProcessPhase1,
  updateFinalUserScoreOnDailyProcess,
  updatePostScoreOnDailyProcess,
  triggerUserScoreDailyProcess
} = require('./scoring');

/*
 * Job processor on daily process trigger.
 * This job is meant to trigger daily process user score phase 1 and daily process post score
 */
const onDailyProcessTrigger = async () => {
  console.debug('onDailyProcessTrigger');
  const db = await getDb();
  const userScoreCol = await db.collection(DB_COLLECTION_USER_SCORE);
  const result = await triggerUserScoreDailyProcess(userScoreCol);
  return result;
};

/*
 * Job processor on daily process user-score phase 1. Received data:
 *   - process_time : text, daily process time. It will be used as a sign/flag to know
 *        which user score has been processed, or we can say it as batch number
 *   - user_ids : array of text, contains list of user id that should be processed for phase 1
 *   - last_batch : boolean, whether this is the last batch.
 *        If it does, then send queue to update final user score
 */
const onDailyProcessUserScorePhase1 = async (data, job) => {
  console.debug('onDailyProcessUserScorePhase1');
  const db = await getDb();
  const userScoreCol = await db.collection(DB_COLLECTION_USER_SCORE);

  const result = await updateUserScoreOnDailyProcessPhase1(
    job,
    userScoreCol,
    data.process_time,
    data.user_ids,
    data.last_batch
  );
  return result;
};

/*
 * Job processor on daily process user-score phase 2. Received data:
 *   - process_time : text, daily process time, alias batch number.
 *      It will be used to check whether all user score has been processed by batch number
 */
const onDailyProcessUserScorePhase2 = async (data) => {
  console.debug('onDailyProcessUserScorePhase2');
  const db = await getDb();
  const userScoreCol = await db.collection(DB_COLLECTION_USER_SCORE);
  const postScoreCol = await db.collection(DB_COLLECTION_POST_SCORE);

  const result = await updateFinalUserScoreOnDailyProcess(
    userScoreCol,
    data.process_time,
    postScoreCol
  );
  return result;
};

/*
 * Job processor on daily process post-score. Received data:
 *   - process_time : text, daily process time. Currently, it just for information, not used yet
 *   - post_ids : array of text, contains list of post id that should be processed
 *   - last_batch : boolean, whether this is the last batch.
 *        Currently, it just for information, not used yet.
 *   - user_scores : JSON of user score by post id.
 *        It will be used to update user score in post score.
 */
const onDailyProcessPostScore = async (data, job) => {
  console.debug('onDailyProcessPostScore');
  const db = await getDb();
  const postScoreCol = await db.collection(DB_COLLECTION_POST_SCORE);

  const result = await updatePostScoreOnDailyProcess(
    job,
    postScoreCol,
    data.process_time,
    data.post_ids,
    data.last_batch,
    data.user_scores
  );
  return result;
};

/*
 * Main function of scoring daily process job
 */
const scoringDailyProcessJob = async (job, done) => {
  // console.log(`scoringProcessJob: ${JSON.stringify(job.data)}`);
  try {
    console.info(`running DAILY PROCESS SCORING job with id: ${job.id}`);
    const messageData = job.data;
    let result = null;
    switch (messageData.event) {
      case EVENT_DAILY_PROCESS_TRIGGER:
        result = await onDailyProcessTrigger();
        break;
      case EVENT_DAILY_PROCESS_USER_SCORE_PHASE1:
        result = await onDailyProcessUserScorePhase1(messageData.data, job);
        break;
      case EVENT_DAILY_PROCESS_USER_SCORE_PHASE2:
        result = await onDailyProcessUserScorePhase2(messageData.data);
        break;
      case EVENT_DAILY_PROCESS_POST_SCORE:
        result = await onDailyProcessPostScore(messageData.data, job);
        break;
      default:
        throw Error('Unknown event');
    }
    console.info(result);
    done(null, result);
  } catch (error) {
    console.error(error);
    done(error);
  }
};

module.exports = {
  scoringDailyProcessJob,
  onDailyProcessTrigger,
  onDailyProcessUserScorePhase2
};
