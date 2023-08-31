const {redisClient} = require('../redis/MainConfig');
const {getDb} = require('../config/mongodb_conn');
const postgresClient = require('./postgres/pool');
const {sequelize} = require('../databases/models');

const statusHealthService = {
  async isReady() {
    try {
      await this.checkRedis();
      await this.checkMongoDb();
      await this.checkPostgres();
      return true;
    } catch (err) {
      return false;
    }
  },
  async checkRedis() {
    // based on https://github.com/redis/ioredis/blob/9c175502b53b400a31bd8bddc8e9a469856bc820/lib/Redis.ts#L176C1-L184C1
    await redisClient.ping();
  },
  async checkMongoDb() {
    const mongoDb = await getDb();
    await mongoDb.command({ping: 1});
  },
  async checkPostgres() {
    // check our pg pool
    await postgresClient.query('SELECT 1');
    // check our sequelize
    await sequelize.authenticate();
  }
};

module.exports = statusHealthService;
