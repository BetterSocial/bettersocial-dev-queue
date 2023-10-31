const {successResponse, errorResponse} = require('../../utils');
const {onDailyProcessUserScorePhase2} = require('../../processes/scoring-daily-process');

const updateUserScorePhase2 = async (req, res) => {
  try {
    const {data} = req.body;
    const result = await onDailyProcessUserScorePhase2(data);
    return successResponse(res, 'onDailyProcessUserScorePhase2 sucesfully', result);
  } catch (error) {
    console.log(error);
    return errorResponse(res, error.toString(), 500);
  }
};

module.exports = {
  updateUserScorePhase2
};
