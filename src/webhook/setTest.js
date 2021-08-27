const { testQueue } = require("../config");
const serviceTestQueue = async (req, res) => {
  try {
    console.log("run test");
    const job = await testQueue.add({
      message: "hello",
      status: "test",
    });
    console.log("job ", job.data);
    return res.json({
      ststus: "success",
      message: job,
    });
  } catch (error) {
    return res.json({
      ststus: "error",
      message: error,
    });
  }
};

module.exports = { serviceTestQueue };
