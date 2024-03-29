const Bull = require('bull');
const {v4: uuidv4} = require('uuid');
const {redisUrl} = require('../redis/MainConfig');

const connectRedis = redisUrl;

// init the scoring process queue object, to be used on sending message to the queue
// For production

const redisOptions = {};

// For local
// const redisOptions = {};

const scoringDailyProcessQueue = new Bull('scoringDailyProcessQueue', connectRedis, redisOptions);
scoringDailyProcessQueue.on('error', (err) => console.log('scoringDailyProcessQueue', err));

const sendQueueForDailyProcess = async (event, data) => {
  const queueData = {
    event,
    data
  };

  const options = {
    jobId: uuidv4(),
    removeOnComplete: true
  };

  scoringDailyProcessQueue.add(queueData, options);
};

const sendQueueForCronDailyProcess = async (event, data) => {
  const queueData = {
    event,
    data
  };

  const options = {
    jobId: uuidv4(),
    removeOnComplete: true
  };

  return await scoringDailyProcessQueue.add(queueData, {
    ...options,
    backoff: {type: 'exponential', delay: 5 * 1000}
  });
};

module.exports = {
  sendQueueForDailyProcess,
  sendQueueForCronDailyProcess
};
