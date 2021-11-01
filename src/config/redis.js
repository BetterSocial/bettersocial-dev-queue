const Bull = require("bull");

const newsQueue = new Bull("newsQueue", String(process.env.REDIS_URL));
// const testQueue = new Bull("testQueue", String(process.env.REDIS_URL), {
// redis: { tls: { rejectUnauthorized: false } },
// }, {
//   redis: { tls: { rejectUnauthorized: false } },
// });
// testQueue.on("error", (err) => {
//   console.log("err test ", err);
// });

const postTimeQueue = new Bull(
  "addQueuePostTime",
  String(process.env.REDIS_URL)
);

const locationQueue = new Bull(
  "followLocationQueue",
  String(process.env.REDIS_URL)
);

const followUserQueue = new Bull(
  "followUserQueue",
  String(process.env.REDIS_URL)
);

const followTopicQueue = new Bull(
  "followTopicQueue",
  String(process.env.REDIS_URL)
);

const addUserToChannelQueue = new Bull(
  "addUserToChannelQueue",
  String(process.env.REDIS_URL)
);

const addUserToTopicChannelQueue = new Bull(
  "addUserToTopicChannelQueue",
  String(process.env.REDIS_URL)
);

module.exports = {
  newsQueue,
  postTimeQueue,
  locationQueue,
  followTopicQueue,
  followUserQueue,
  // testQueue,
  addUserToChannelQueue,
  addUserToTopicChannelQueue,
};
