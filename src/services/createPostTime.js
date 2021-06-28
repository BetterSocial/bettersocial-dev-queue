const createQueuePostTime = async (req, res) => {
  try {
    const { getToken } = require("../utils");
    const token = getToken(req);
    if (token == null) {
      return res.status(401).json({
        code: 401,
        message: "Failed auth",
        data: null,
      });
    } else {
      if (req.body.post_id && req.body.view_time) {
        const jwt = require("jsonwebtoken");
        const { v4: uuidv4 } = require('uuid');
        const user_id = jwt.decode(token).user_id;
        const { postTimeQueue } = require('../config/redis');
        /*
          @description options bull queue ref https://www.npmjs.com/package/bull
        */
        const options = {
          jobId: uuidv4(),
          removeOnComplete: true,
        };
        const { post_id, view_time } = req.body;
        const data = { post_id, user_id, view_time };
        const resultJob = await postTimeQueue.add(data, options);
        return res.status(200).json({
          code: 200,
          status: `success created queue post time with job id : ${resultJob.id}`,
          data: data,
        });
      } else {
        return res.status(500).json({
          code: 500,
          status: `body is required`,
          data: null,
        });
      }
    }
  } catch (error) {
    console.info(error);
    return res.status(500).json({
      code: 500,
      data: null,
      message: "Internal server error",
      error: error.toString(),
    });
  }
}

module.exports = {
  createQueuePostTime
}
