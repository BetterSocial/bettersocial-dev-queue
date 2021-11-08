const Bull = require("bull");

const newsQueue = new Bull("newsQueue", {
  redis: {
    password: process.env.REDIS_PASSWORD,
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    tls: {
      rejectUnauthorized: false,
      servername: process.env.REDIS_HOST
    }
  },
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
    redis: {
      password: process.env.REDIS_PASSWORD,
      host: process.env.REDIS_HOST,
      port: process.env.REDIS_PORT,
      tls: {
        rejectUnauthorized: false,
        servername: process.env.REDIS_HOST
      }
    },
  }
);

const locationQueue = new Bull(
  "followLocationQueue",
  {
    redis: {
      password: process.env.REDIS_PASSWORD,
      host: process.env.REDIS_HOST,
      port: process.env.REDIS_PORT,
      tls: {
        rejectUnauthorized: false,
        servername: process.env.REDIS_HOST
      }
    },
  }
);

const followUserQueue = new Bull(
  "followUserQueue",
  {
    redis: {
      password: process.env.REDIS_PASSWORD,
      host: process.env.REDIS_HOST,
      port: process.env.REDIS_PORT,
      tls: {
        rejectUnauthorized: false,
        servername: process.env.REDIS_HOST
      }
    },
  }
);

const followTopicQueue = new Bull(
  "followTopicQueue",
  {
    redis: {
      password: process.env.REDIS_PASSWORD,
      host: process.env.REDIS_HOST,
      port: process.env.REDIS_PORT,
      tls: {
        rejectUnauthorized: false,
        servername: process.env.REDIS_HOST
      }
    },
  }
);

const addUserToChannelQueue = new Bull(
  "addUserToChannelQueue",
  {
    redis: {
      password: process.env.REDIS_PASSWORD,
      host: process.env.REDIS_HOST,
      port: process.env.REDIS_PORT,
      tls: {
        rejectUnauthorized: false,
        servername: process.env.REDIS_HOST
      }
    },
  }
);

const addUserToTopicChannelQueue = new Bull(
  "addUserToTopicChannelQueue",
  {
    redis: {
      password: process.env.REDIS_PASSWORD,
      host: process.env.REDIS_HOST,
      port: process.env.REDIS_PORT,
      tls: {
        rejectUnauthorized: false,
        servername: process.env.REDIS_HOST
      }
    },
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
