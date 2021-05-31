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
  console.info(`dari request ${req.body}`);
  console.info(res.body);
  try {
    const { v4: uuidv4 } = require('uuid');
    const Queue = require('bull');

    const newsQueue = new Queue('newsQueue', process.env.REDIS_URL);
    const options = {
      jobId: uuidv4()
    };
    if (req.body[0].new[0].message) {
      if(testIfValidURL(req.body[0].new[0].message)) {
        const getJob = await newsQueue.add({ body: req.body[0].new[0].message }, options);
        return res.status(200).json({
          code: 200,
          status: `success created news with job id : ${getJob.id}`,
          data: req.body,
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
}

module.exports = {
  createQueueNews
}
