const {successResponse, errorResponse} = require('../../utils');
const UsersFunction = require('../../databases/functions/users');

const setAllFollowerCount = async (req, res) => {
  try {
    try {
      await UsersFunction.setAllFollowerCount();
    } catch (error) {
      return errorResponse(res, 'Failed to set follower count', 500);
    }

    return successResponse(res, 'set follower count was successful');
  } catch (error) {
    console.log(error);
    return errorResponse(res, error.toString(), 500);
  }
};

module.exports = {
  setAllFollowerCount
};
