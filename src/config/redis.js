const Bull = require("bull");

// const newsQueue = new Bull("newsQueue", {
//   redis: process.env.REDIS_URL || process.env.REDIS_TLS_URL,
// });
const newsQueue = new Bull("newsQueue", process.env.REDIS_URL);
const testQueue = new Bull("testQueue", process.env.REDIS_URL);

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

const addMemberToChannelQueue = new Bull("addMemberToChannelQueue", {
  redis: process.env.REDIS_URL || process.env.REDIS_TLS_URL,
});

module.exports = {
  newsQueue,
  postTimeQueue,
  locationQueue,
  followTopicQueue,
  followUserQueue,
  addMemberToChannelQueue,
  testQueue,
};
