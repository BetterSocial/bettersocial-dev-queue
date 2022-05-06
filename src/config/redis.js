const Bull = require("bull");

const connectRedis = process.env.REDIS_URL;

// for production
const queueOptions = {
  redis: { tls: { rejectUnauthorized: false, requestCert: true, } }
};

// for development
//const queueOptions = {};

const newsQueue = new Bull("newsQueue", connectRedis, queueOptions);

// const testQueue = new Bull("testQueue", process.env.REDIS_URL, {
// redis: { tls: { rejectUnauthorized: false } },
// }, {
//   redis: { tls: { rejectUnauthorized: false } },
// });
// testQueue.on("error", (err) => {
//   console.log("err test ", err);
// });

const postTimeQueue = new Bull("addQueuePostTime", connectRedis, queueOptions);

//const locationQueue = new Bull("followLocationQueue", connectRedis, queueOptions);

//const followUserQueue = new Bull("followUserQueue", connectRedis, queueOptions);

//const followTopicQueue = new Bull( "followTopicQueue", connectRedis, queueOptions);

//const addUserToChannelQueue = new Bull("addUserToChannelQueue", connectRedis, queueOptions);

//const addUserToTopicChannelQueue = new Bull("addUserToTopicChannelQueue", connectRedis, queueOptions);

//const prepopulatedDmQueue = new Bull("prepopulatedDmQueue", connectRedis, queueOptions);

const registerQueue = new Bull("registerQueue", connectRedis, queueOptions);

// special queue for scoring process
const scoringProcessQueue = new Bull("scoringProcessQueue", connectRedis, queueOptions);

// special queue for scoring daily process
const scoringDailyProcessQueue = new Bull("scoringDailyProcessQueue", connectRedis, queueOptions);

module.exports = {
  newsQueue,
  postTimeQueue,
  // locationQueue,
  // followTopicQueue,
  // followUserQueue,
  // testQueue,
  // addUserToChannelQueue,
  // addUserToTopicChannelQueue,
  // prepopulatedDmQueue,
  registerQueue,
  scoringProcessQueue,
  scoringDailyProcessQueue,
};
