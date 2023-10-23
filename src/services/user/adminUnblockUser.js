const {successResponse, errorResponse} = require('../../utils');
const {adminUnblockUserProcess} = require('../../processes/scoring/admin-block-unblock-user');

const adminUnblockUser = async (req, res) => {
  try {
    const {userId} = req.body;
    if (!userId) {
      return errorResponse(res, 'userId is required', 400);
    }
    const updateResult = await adminUnblockUserProcess(userId);
    return successResponse(res, 'unblock user by admin was successful', updateResult);
  } catch (error) {
    console.log(error);
    return errorResponse(res, error.toString(), 500);
  }
};

module.exports = {
  adminUnblockUser
};