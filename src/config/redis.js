const Bull = require("bull");

// const newsQueue = new Bull("newsQueue", {
//   redis: process.env.REDIS_URL || process.env.REDIS_TLS_URL,
// });
const newsQueue = new Bull("newsQueue", String(process.env.REDIS_URL));
newsQueue.on("error", (err) => {
  console.log("newsQueue error : ", err);
  console.log("redis url ", process.env.REDIS_URL);
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
};
