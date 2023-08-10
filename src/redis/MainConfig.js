const Redis = require('ioredis');

const redisUrl = process.env.REDIS_ENTERPRISE_URL;
const redisCredentials = {
  redis: {
    host: process.env.REDIS_ENTERPRISE_HOST,
    username: process.env.REDIS_ENTERPRISE_USERNAME,
    password: process.env.REDIS_ENTERPRISE_PASSWORD,
    port: process.env.REDIS_ENTERPRISE_PORT
  }
};

const redisConfig = {};

const redisClient = new Redis(redisUrl, redisConfig);
const bullConfig = {};
console.log('redisUrl', redisUrl);
console.log('redisCredentials', redisCredentials);

module.exports = {
  bullConfig,
  redisClient,
  redisUrl,
  redisCredentials
};
