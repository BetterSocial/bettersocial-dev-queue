const {successResponse, errorResponse} = require('../utils');

const {
  setInitialDataUserScore
} = require('../processes/scoring/formula/set-initial-data-user-score');

const syncUserScore = async (req, res) => {
  try {
    const {userId} = req.body;
    const result = await setInitialDataUserScore(userId);
    return successResponse(res, 'sync data sucesfully', result);
  } catch (error) {
    console.log(error);
    return errorResponse(res, error.toString(), 500);
  }
};

module.exports = {
  syncUserScore
};
