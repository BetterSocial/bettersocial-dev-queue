const moment = require('moment');
const {successResponse, errorResponse} = require('../../utils');
const {onUnblockUser} = require('../../processes/scoring-process');

const isValidData = (data) => {
  let valid = true;
  if (!data) {
    valid = false;
  } else if (!data.user_id) {
    valid = false;
  } else if (!data.unblocked_user_id) {
    valid = false;
  }
  return valid;
};

const unblockUser = async (req, res) => {
  try {
    const {data} = req.body;
    if (!isValidData(data)) {
      return errorResponse(res, 'Invalid data', 400);
    }
    data['activity_time'] = moment.utc().format('YYYY-MM-DD HH:mm:ss');
    const result = await onUnblockUser(data);
    return successResponse(res, 'block user sucesfully', result);
  } catch (error) {
    console.log(error);
    return errorResponse(res, error.toString(), 500);
  }
};

module.exports = {
  unblockUser
};
