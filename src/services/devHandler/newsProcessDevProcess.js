/* eslint-disable camelcase */
const {v4: uuidv4} = require('uuid');
const {newsQueue} = require('../../config');
const {checkIfValidURL, successResponse, errorResponse} = require('../../utils');

const newsProcessDevProcess = async (req, res) => {
  const bodyData = req.body?.message;
  const id_feed = req.body?.id || false;
  const user_id = req.body?.actor?.id || false;
  const topics = req.body?.topics || [];
  const duration_feed = req.body?.duration_feed || '';

  const options = {
    jobId: uuidv4(),
    removeOnComplete: true
  };

  console.log('check if valid url', checkIfValidURL(bodyData));

  if (checkIfValidURL(bodyData)) {
    const getJob = await newsQueue.add(
      {
        body: checkIfValidURL(bodyData),
        id_feed,
        user_id,
        topics,
        duration_feed
      },
      options
    );
    return successResponse(res, `success created news with job id : ${getJob.id}`, bodyData);
  }

  return errorResponse(res, 'Failed to create news job', 400);
};

module.exports = {
  newsProcessDevProcess
};
