const createQueueNews = async (req, res) => {
  // for local test in postman uncomment this line
  // const bodyData = req.body.message
  // const id_feed = req.body.id || false
  // const user_id = req.body.actor_id || null
  // const topics = req.body.topics || null
  // const duration_feed = +req.body.duration_feed || null
  const bodyData = req.body[0]?.new[0]?.message;
  const id_feed = req.body[0]?.new[0]?.id || false;
  const user_id = req.body[0]?.new[0]?.actor?.id || false;
  const topics = req.body[0]?.new[0]?.topics || [];
  const duration_feed = req.body[0]?.new[0]?.duration_feed || "";
  const {
    checkIfValidURL,
    successResponse,
    errorResponse,
  } = require("../utils");
  if (bodyData) {
    console.log('body data');
    try {
      const { v4: uuidv4 } = require("uuid");
      const { newsQueue } = require("../config");
      /*
        @description options bull queue ref https://www.npmjs.com/package/bull
      */
      const options = {
        jobId: uuidv4(),
        removeOnComplete: true,
      };
      if (checkIfValidURL(bodyData)) {
        console.log('validasi url berhasil');
        const getJob = await newsQueue.add(
          {
            body: checkIfValidURL(bodyData),
            id_feed,
            user_id,
            topics,
            duration_feed,
          },
          options
        );
        console.log(`success created news with job id : ${getJob.id}`);
        return successResponse(
          res,
          `success created news with job id : ${getJob.id}`,
          bodyData
        );
      } else {
        console.log('error validasi url');
        return errorResponse(res, 'url is invalid', 400);
        // throw new Error("url is invalid");
      }
    } catch (error) {
      console.log(error);
      return errorResponse(res, error.toString(), 500);
    }
  } else {
    console.log('sukses tanpa data');
    return successResponse(res, "ok", "Job running");
  }
};

module.exports = {
  createQueueNews,
};
