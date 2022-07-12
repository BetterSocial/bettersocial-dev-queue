const Bull = require("bull");
const { v4: uuidv4 } = require("uuid");
const connectRedis = process.env.REDIS_URL;

// init the scoring process queue object, to be used on sending message to the queue
// For production

const redisOptions = {
  redis: {
    tls: { rejectUnauthorized: false, requestCert: true, agent: false, },
    maxRetriesPerRequest: 100,
    connectTimeout: 30000
  }
}

// For local
// const redisOptions = {};

const scoringDailyProcessQueue = new Bull(
  "scoringDailyProcessQueue",
  connectRedis,
  redisOptions
);
scoringDailyProcessQueue.on("error", (err) =>
  console.log("scoringDailyProcessQueue", err)
);

const sendQueueForDailyProcess = async (event, data) => {
  console.log(
    "queueSenderForRedis.sendQueueForDailyProcess called with event[" +
      event +
      "] and data [" +
      JSON.stringify(data) +
      "]"
  );

  let queueData = {
    event: event,
    data: data,
  };

  const options = {
    jobId: uuidv4(),
    removeOnComplete: true,
  };

  scoringDailyProcessQueue.add(queueData, options);

  return;
};

const sendQueueForCronDailyProcess = async (event, data) => {
  console.log(
    "queueSenderForRedis.sendQueueForDailyProcess called with event[" +
      event +
      "] and data [" +
      JSON.stringify(data) +
      "]"
  );

  let queueData = {
    event: event,
    data: data,
  };

  const options = {
    jobId: uuidv4(),
    removeOnComplete: true,
  };

  return await scoringDailyProcessQueue.add(queueData, options);
};

module.exports = {
  sendQueueForDailyProcess,
  sendQueueForCronDailyProcess,
};
