const moment = require('moment');
const {successResponse, errorResponse} = require('../../utils');
const {onCancelUpvotePost} = require('../../processes/scoring-process');

const isValidData = ({user_id, feed_id}) => {
  return !!user_id && !!feed_id;
};

const cancelUpvotePost = async (req, res) => {
  try {
    const {data} = req.body;

    if (!isValidData(data)) {
      return errorResponse(res, 'Invalid data', 400);
    }
    data.activity_time = moment.utc().format('YYYY-MM-DD HH:mm:ss');
    const result = await onCancelUpvotePost(data);
    return successResponse(res, 'cancel upvote activity sucesfully', result);
  } catch (error) {
    console.log(error);
    return errorResponse(res, error.toString(), 500);
  }
};

module.exports = {
  cancelUpvotePost
};
