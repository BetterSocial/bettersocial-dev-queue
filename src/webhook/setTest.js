const { testQueue, weeklyCredderUpdateQueue } = require("../config");
const serviceTestQueue = async (req, res) => {
  let { url } = req.body
  try {
    console.log("run test");
    const job = await weeklyCredderUpdateQueue.add({});
    console.log("job ", job.data);
    return res.json({
      ststus: "success",
      message: job,
    });
  } catch (error) {
    console.log('error')
    console.log(error)
    return res.json({
      ststus: "error",
      message: error,
    });
  }
};

module.exports = { serviceTestQueue };
