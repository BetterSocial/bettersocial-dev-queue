const Bull = require('bull');

const newsQueue = new Bull('newsQueue', {
  redis: process.env.REDIS_URL || process.env.REDIS_TLS_URL,
});

// const emailQueue = new Bull("email", {
//   redis: process.env.REDIS_URL || process.env.REDIS_TLS_URL,
// });

const addQueuePostTime = new Bull('addQueuePostTime', {
  redis: process.env.REDIS_URL || process.env.REDIS_TLS_URL,
});

const updateQueuePostTime = new Bull('updateQueuePostTime', {
  redis: process.env.REDIS_URL || process.env.REDIS_TLS_URL,
});

module.exports = {
  newsQueue, addQueuePostTime, updateQueuePostTime
}

