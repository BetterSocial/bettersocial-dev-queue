const Redis = require('ioredis');

const redisUrl = process.env.REDIS_ENTERPRISE_URL;
const redisConfig = {};

const redisClient = new Redis(redisUrl, redisConfig);
const bullConfig = {};
console.log('redisUrl', redisUrl);

module.exports = {
  bullConfig,
  redisClient,
  redisUrl
};
