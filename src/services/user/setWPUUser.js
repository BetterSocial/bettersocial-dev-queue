const {successResponse, errorResponse} = require('../../utils');
const {adminBlockUserProcess} = require('../../processes/scoring/admin-block-unblock-user');
const UsersFunction = require('../../databases/functions/users');

const setWPUUser = async (req, res) => {
  try {
    const {userId, score} = req.body;
    if (!userId) {
      return errorResponse(res, 'userId is required', 400);
    }
    if (!score) {
      return errorResponse(res, 'score is required', 400);
    }

    try {
      await UsersFunction.setWPUUser(userId, score);
    } catch (error) {
      return errorResponse(res, 'Failed to update w pu user', 500);
    }
    const updateResult = await adminBlockUserProcess(userId);
    return successResponse(res, 'update w pu user was successful', updateResult);
  } catch (error) {
    console.log(error);
    return errorResponse(res, error.toString(), 500);
  }
};

module.exports = {
  setWPUUser
};
