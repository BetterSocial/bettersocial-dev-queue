const { testQueue } = require("../config");
const testQueue = async (req, res) => {
  console.log("run test");
  const job = await testQueue.add({
    message: "hello",
    status: "test",
  });
  return job;
};

module.exports = { testQueue };
