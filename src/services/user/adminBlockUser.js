const {successResponse, errorResponse} = require('../../utils');
const {adminBlockUserProcess} = require('../../processes/scoring/admin-block-unblock-user');
const UsersFunction = require('../../databases/functions/users');

const adminBlockUser = async (req, res) => {
  try {
    const {userId} = req.body;
    if (!userId) {
      return errorResponse(res, 'userId is required', 400);
    }
    try {
      await UsersFunction.userBlockByAdmin(userId);
    } catch (error) {
      return errorResponse(res, 'Failed to block user by admin', 500);
    }
    const updateResult = await adminBlockUserProcess(userId);
    return successResponse(res, 'block user by admin was successful', updateResult);
  } catch (error) {
    console.log(error);
    return errorResponse(res, error.toString(), 500);
  }
};

module.exports = {
  adminBlockUser
};
