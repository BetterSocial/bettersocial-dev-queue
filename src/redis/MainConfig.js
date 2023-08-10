const Redis = require('ioredis');

const redisUrl = process.env.REDIS_ENTERPRISE_URL;
console.log('redisUrl', redisUrl);
const redisCredentials = {
  host: process.env.REDIS_ENTERPRISE_HOST,
  username: process.env.REDIS_ENTERPRISE_USERNAME,
  password: process.env.REDIS_ENTERPRISE_PASSWORD,
  port: process.env.REDIS_ENTERPRISE_PORT
};

const redisConfig = {};

const redisClient = new Redis(redisCredentials, redisConfig);
const bullConfig = {};

module.exports = {
  bullConfig,
  redisClient,
  redisUrl,
  redisCredentials
};
