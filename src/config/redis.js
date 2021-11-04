const Bull = require("bull");

const newsQueue = new Bull("newsQueue", {
  redis: process.env.REDIS_URL || process.env.REDIS_TLS_URL,
});
// const testQueue = new Bull("testQueue", process.env.REDIS_URL, {
// redis: { tls: { rejectUnauthorized: false } },
// }, {
//   redis: { tls: { rejectUnauthorized: false } },
// });
// testQueue.on("error", (err) => {
//   console.log("err test ", err);
// });

const postTimeQueue = new Bull(
  "addQueuePostTime",
  {
    redis: process.env.REDIS_URL || process.env.REDIS_TLS_URL,
  }
);

const locationQueue = new Bull(
  "followLocationQueue",
  {
    redis: process.env.REDIS_URL || process.env.REDIS_TLS_URL,
  }
);

const followUserQueue = new Bull(
  "followUserQueue",
  {
    redis: process.env.REDIS_URL || process.env.REDIS_TLS_URL,
  }
);

const followTopicQueue = new Bull(
  "followTopicQueue",
  {
    redis: process.env.REDIS_URL || process.env.REDIS_TLS_URL,
  }
);

const addUserToChannelQueue = new Bull(
  "addUserToChannelQueue",
  {
    redis: process.env.REDIS_URL || process.env.REDIS_TLS_URL,
  }
);

const addUserToTopicChannelQueue = new Bull(
  "addUserToTopicChannelQueue",
  {
    redis: process.env.REDIS_URL || process.env.REDIS_TLS_URL,
  }
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
