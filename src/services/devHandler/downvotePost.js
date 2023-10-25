const moment = require('moment');
const {successResponse, errorResponse} = require('../../utils');
const {onDownvotePost} = require('../../processes/scoring-process');

const isValidData = ({user_id, feed_id}) => {
  return !!user_id && !!feed_id;
};

const downvotePost = async (req, res) => {
  try {
    const {data} = req.body;

    if (!isValidData(data)) {
      return errorResponse(res, 'Invalid data', 400);
    }
    data.activity_time = moment.utc().format('YYYY-MM-DD HH:mm:ss');
    const result = await onDownvotePost(data);
    return successResponse(res, 'block user sucesfully', result);
  } catch (error) {
    console.log(error);
    return errorResponse(res, error.toString(), 500);
  }
};

module.exports = {
  downvotePost
};
