function testIfValidURL(str) {
  const pattern = new RegExp('^https?:\\/\\/' + // protocol
    '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
    '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
    '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
    '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
    '(\\#[-a-z\\d_]*)?$', 'i'); // fragment locator

  return !!pattern.test(str);
}

const createQueueNews = async (req, res) => {
  const bodyData = req.body[0]?.new[0]?.message
  if (bodyData) {
    try {
      const { v4: uuidv4 } = require('uuid');
      const Queue = require('bull');

      const newsQueue = new Queue('newsQueue', process.env.REDIS_URL);
      const options = {
        jobId: uuidv4()
      };
      if (bodyData) {
        if(testIfValidURL(bodyData)) {
          const getJob = await newsQueue.add({ body: bodyData }, options);
          return res.status(200).json({
            code: 200,
            status: `success created news with job id : ${getJob.id}`,
            data: bodyData,
          });
        } else {
          throw new Error('url is invalid');
        }
      } else {
        throw new Error('url is required');
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
      data: "Webhook running",
    });
  }
}

module.exports = {
  createQueueNews
}
