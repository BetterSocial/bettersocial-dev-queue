const {successResponse, errorResponse} = require('../../utils');
const {onDailyProcessTrigger} = require('../../processes/scoring-daily-process');

const triggerDailyScoring = async (req, res) => {
  try {
    const result = await onDailyProcessTrigger();
    return successResponse(res, 'triggerDailyScoring sucesfully', result);
  } catch (error) {
    console.log(error);
    return errorResponse(res, error.toString(), 500);
  }
};

module.exports = {
  triggerDailyScoring
};
