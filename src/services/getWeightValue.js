const { successResponse, errorResponse } = require("../utils");
const { USER_SCORE_WEIGHT,
  POST_SCORE_P1_WEIGHT,
  POST_SCORE_P2_WEIGHT,
  POST_SCORE_P3_WEIGHT,
  PREVIOUS_INTERACTION_WEIGHT,
  REACTION_WEIGHT,
  FINAL_SCORE_WEIGHT } = require("../processes/scoring/formula/constant");

const getWeightValue = (req, res) => {
  try {
    const result = {USER_SCORE_WEIGHT,
      POST_SCORE_P1_WEIGHT,
      POST_SCORE_P2_WEIGHT,
      POST_SCORE_P3_WEIGHT,
      PREVIOUS_INTERACTION_WEIGHT,
      REACTION_WEIGHT,
      FINAL_SCORE_WEIGHT}
    return successResponse(res, "Current Weight Value", result);
  } catch (error) {
    console.error(error);
    return errorResponse(res, error.toString(), 500);
  }
};

module.exports = {
  getWeightValue
};
