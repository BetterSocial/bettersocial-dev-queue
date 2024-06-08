const {successResponse, errorResponse} = require('../../utils');
const {topicAutoMessageProcess} = require('../../processes/topic-auto-msg-process');

const triggerTopicAutoMessage = async (req, res) => {
  try {
    const result = await topicAutoMessageProcess();
    return successResponse(res, 'triggerTopicAutoMessage succesfully', result);
  } catch (error) {
    console.log(error);
    return errorResponse(res, error.toString(), 500);
  }
};

module.exports = {
  triggerTopicAutoMessage
};
