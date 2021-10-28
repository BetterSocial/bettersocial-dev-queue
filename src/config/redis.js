const Bull = require("bull");

const newsQueue = new Bull("newsQueue", process.env.REDIS_TLS_URL, {
  redis: { tls: { rejectUnauthorized: false } },
});
const testQueue = new Bull("testQueue", String(process.env.REDIS_TLS_URL), {
  redis: { tls: { rejectUnauthorized: false } },
});
testQueue.on("error", (err) => {
  console.log("err test ", err);
});
const postTimeQueue = new Bull("addQueuePostTime", process.env.REDIS_TLS_URL, {
  redis: { tls: { rejectUnauthorized: false } },
});

const locationQueue = new Bull(
  "followLocationQueue",
  process.env.REDIS_TLS_URL,
  {
    redis: { tls: { rejectUnauthorized: false } },
  }
);

const followUserQueue = new Bull("followUserQueue", process.env.REDIS_TLS_URL, {
  redis: { tls: { rejectUnauthorized: false } },
});

const followTopicQueue = new Bull(
  "followTopicQueue",
  process.env.REDIS_TLS_URL,
  {
    redis: { tls: { rejectUnauthorized: false } },
  }
);

const addUserToChannelQueue = new Bull(
  "addUserToChannelQueue",
  process.env.REDIS_TLS_URL,
  {
    redis: { tls: { rejectUnauthorized: false } },
  }
);

const addUserToTopicChannelQueue = new Bull(
  "addUserToTopicChannelQueue",
  process.env.REDIS_TLS_URL,
  {
    redis: { tls: { rejectUnauthorized: false } },
  }
);

module.exports = {
  newsQueue,
  postTimeQueue,
  locationQueue,
  followTopicQueue,
  followUserQueue,
  testQueue,
  addUserToChannelQueue,
  addUserToTopicChannelQueue,
};
