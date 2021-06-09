function testIfValidURL(str) {
  const urlRegex = /(https?:\/\/[^ ]*)/;
  const urlValidation = str.match(urlRegex);

  if (urlValidation) {
    return str.match(urlRegex)[1]
  } else {
    return false
  }
}

const createQueueNews = async (req, res) => {
  const bodyData = req.body[0]?.new[0]?.message
  const bodyIdData = req.body[0]?.new[0]?.id || false
  if (bodyData) {
    try {
      const { v4: uuidv4 } = require('uuid');
      const Queue = require('bull');

      const newsQueue = new Queue('newsQueue', process.env.REDIS_URL);
      const options = {
        jobId: uuidv4()
      };
      if (testIfValidURL(bodyData)) {
        const getJob = await newsQueue.add({ body: testIfValidURL(bodyData), id_feed: bodyIdData }, options);
        return res.status(200).json({
          code: 200,
          status: `success created news with job id : ${getJob.id}`,
          data: bodyData,
        });
      } else {
        throw new Error('url is invalid');
      }
    } catch (error) {
      return res.status(500).json({
        code: 500,
        data: null,
        message: "Internal server error",
        error: error.toString(),
      });
    }
  } else {
    return res.status(200).json({
      code: 200,
      status: "ok",
      data: "Job running",
    });
  }
}

module.exports = {
  createQueueNews
}
