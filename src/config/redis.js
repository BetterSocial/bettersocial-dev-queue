const Bull = require('bull');

const newsQueue = new Bull('newsQueue', {
  redis: process.env.REDIS_URL || process.env.REDIS_TLS_URL,
});

// const emailQueue = new Bull("email", {
//   redis: process.env.REDIS_URL || process.env.REDIS_TLS_URL,
// });

module.exports = {
  newsQueue
}

