const Bull = require("bull");

const connectRedis = process.env.REDIS_URL;

const newsQueue = new Bull("newsQueue", connectRedis, { redis: { tls: { rejectUnauthorized: false } } });
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
  connectRedis,
  {
    redis: { tls: { rejectUnauthorized: false } }
  }
);

const locationQueue = new Bull(
  "followLocationQueue",
  connectRedis,
  {
    redis: { tls: { rejectUnauthorized: false } }
  }
);

const followUserQueue = new Bull(
  "followUserQueue",
  connectRedis,
  {
    redis: { tls: { rejectUnauthorized: false } }
  }
);

const followTopicQueue = new Bull(
  "followTopicQueue",
  connectRedis,
  {
    redis: { tls: { rejectUnauthorized: false } }
  }
);

const addUserToChannelQueue = new Bull(
  "addUserToChannelQueue",
  connectRedis,
  {
    redis: { tls: { rejectUnauthorized: false } }
  }
);

const addUserToTopicChannelQueue = new Bull(
  "addUserToTopicChannelQueue",
  connectRedis,
  {
    redis: { tls: { rejectUnauthorized: false } }
  }
);

const prepopulatedDmQueue = new Bull(
  "prepopulatedDmQueue",
  connectRedis,
  {
    redis: { tls: { rejectUnauthorized: false } }
  }
)

module.exports = {
  newsQueue,
  postTimeQueue,
  locationQueue,
  followTopicQueue,
  followUserQueue,
  // testQueue,
  addUserToChannelQueue,
  addUserToTopicChannelQueue,
  prepopulatedDmQueue,
};
