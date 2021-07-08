const createQueueNews = async (req, res) => {
  // for local test in postman uncomment this line
  // const bodyData = req.body.message
  // const id_feed = req.body.id || false
  // const user_id = req.body.actor_id || null
  // const user_id = req.body.topics || null
  // const user_id = req.body.duration_feed || null
  const bodyData = req.body[0]?.new[0]?.message
  const id_feed = req.body[0]?.new[0]?.id || false
  const user_id = req.body[0]?.new[0]?.topics || []
  const user_id = req.body[0]?.new[0]?.duration_feed || ""
  const { checkIfValidURL, successResponse, errorResponse } = require('../utils');
  if (bodyData) {
    try {
      const { v4: uuidv4 } = require('uuid');
      const { newsQueue } = require('../config');
      /*
        @description options bull queue ref https://www.npmjs.com/package/bull
      */
      const options = {
        jobId: uuidv4(),
        removeOnComplete: true,
      };
      if (checkIfValidURL(bodyData)) {
        const getJob = await newsQueue.add({
          body: checkIfValidURL(bodyData), id_feed, user_id }, options
        );
        return successResponse(res, `success created news with job id : ${getJob.id}`, bodyData)
      } else {
        throw new Error('url is invalid');
      }
    } catch (error) {
      return errorResponse(res, error.toString(), 500);
    }
  } else {
    return successResponse(res, "ok", "Job running")
  }
}

module.exports = {
  createQueueNews
}
