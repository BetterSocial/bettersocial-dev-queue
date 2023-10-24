const moment = require('moment');
const {successResponse, errorResponse} = require('../../utils');
const {onCancelDownvotePost} = require('../../processes/scoring-process');

const isValidData = ({user_id, blocked_user_id}) => {
  return !!user_id && !!blocked_user_id;
};

const cancelDownvotePost = async (req, res) => {
  try {
    const {data} = req.body;

    if (!isValidData(data)) {
      return errorResponse(res, 'Invalid data', 400);
    }
    data.activity_time = moment.utc().format('YYYY-MM-DD HH:mm:ss');
    const result = await onCancelDownvotePost(data);
    return successResponse(res, 'block user sucesfully', result);
  } catch (error) {
    console.log(error);
    return errorResponse(res, error.toString(), 500);
  }
};

module.exports = {
  cancelDownvotePost
};
