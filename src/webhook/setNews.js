const createQueueNews = async (req, res) => {
  // for local test in postman uncomment this line
  // const bodyData = req.body.message
  // const id_feed = req.body.id || false
  // const user_id = req.body.actor_id || null
  // const topics = req.body.topics || null
  // const duration_feed = +req.body.duration_feed || null
  console.log("res body all ", req.body);
  const bodyData = req.body[0]?.new[0]?.message;
  console.log("res body ", bodyData);
  const id_feed = req.body[0]?.new[0]?.id || false;
  console.log("id Feed ", id_feed);
  const user_id = req.body[0]?.new[0]?.actor?.id || false;
  console.log("user_id ", user_id);
  const topics = req.body[0]?.new[0]?.topics || [];
  const duration_feed = req.body[0]?.new[0]?.duration_feed || "";
  console.log("duration_feed ", duration_feed);
  const {
    checkIfValidURL,
    successResponse,
    errorResponse,
  } = require("../utils");
  if (bodyData) {
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
        // const array = await getJob.finished();
        // console.log("getJob ", JSON.stringify(array));
        return successResponse(
          res,
          `success created news with job id : ${getJob.id}`,
          bodyData
        );
      } else {
        throw new Error("url is invalid");
      }
    } catch (error) {
      console.log(error);
      return errorResponse(res, error.toString(), 500);
    }
  } else {
    return successResponse(res, "ok", "Job running");
  }
};

module.exports = {
  createQueueNews,
};
