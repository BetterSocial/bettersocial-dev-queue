const {successResponse, errorResponse} = require('../../utils');
const {
  updateUserScoreOnDailyProcessPhase1
} = require('../../processes/scoring/update-user-score-on-daily-process-phase1');
const {getDb} = require('../../config/mongodb_conn');
const {DB_COLLECTION_USER_SCORE} = require('../../processes/scoring-constant');

const updateUserScorePhase1 = async (req, res) => {
  try {
    const {process_time, user_ids, last_batch} = req.body;
    const db = await getDb();
    const userScoreCol = await db.collection(DB_COLLECTION_USER_SCORE);
    const result = await updateUserScoreOnDailyProcessPhase1(
      null,
      userScoreCol,
      process_time,
      user_ids,
      last_batch
    );
    return successResponse(res, 'updateUserScoreOnDailyProcessPhase1 sucesfully', result);
  } catch (error) {
    console.log(error);
    return errorResponse(res, error.toString(), 500);
  }
};

module.exports = {
  updateUserScorePhase1
};
