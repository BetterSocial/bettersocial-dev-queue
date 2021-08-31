const Bull = require("bull");

// const newsQueue = new Bull("newsQueue", {
//   redis: process.env.REDIS_URL || process.env.REDIS_TLS_URL,
// });
const newsQueue = new Bull("newsQueue", process.env.REDIS_URL, {
  redis: { tls: { rejectUnauthorized: false } },
});
const testQueue = new Bull("testQueue", String(process.env.REDIS_URL), {
  redis: { tls: { rejectUnauthorized: false } },
});
testQueue.on("error", (err) => {
  console.log("err test ", err);
});

// const emailQueue = new Bull("email", {
//   redis: process.env.REDIS_URL || process.env.REDIS_TLS_URL,
// });

const postTimeQueue = new Bull("addQueuePostTime", {
  redis: process.env.REDIS_URL || process.env.REDIS_TLS_URL,
});

const locationQueue = new Bull("followLocationQueue", {
  redis: process.env.REDIS_URL || process.env.REDIS_TLS_URL,
});

const followUserQueue = new Bull("followUserQueue", {
  redis: process.env.REDIS_URL || process.env.REDIS_TLS_URL,
});
const followTopicQueue = new Bull("followTopicQueue", {
  redis: process.env.REDIS_URL || process.env.REDIS_TLS_URL,
});

const addUserToChannelQueue = new Bull("addUserToChannelQueue", {
  redis: process.env.REDIS_URL || process.env.REDIS_TLS_URL,
});

module.exports = {
  newsQueue,
  postTimeQueue,
  locationQueue,
  followTopicQueue,
  followUserQueue,
  testQueue,
  addUserToChannelQueue,
};
