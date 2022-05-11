require('dotenv').config();
const {
  EVENT_DAILY_PROCESS_TRIGGER,
} = require("./processes/scoring-constant");

const scoringProcessQueue = require("./queues/queueSenderForRedis"); // uncomment this line if using redis as message queue server
//const scoringProcessQueue = require("./queues/queueSenderForKafka"); // uncomment this line if using kafka as message queue server

console.log("Starting cron job daily process scoring");

// sending queue for scoring process on follow user event
scoringProcessQueue.sendQueueForCronDailyProcess(EVENT_DAILY_PROCESS_TRIGGER, {})
  .then((result) => {
      console.log("DONE");
      process.exit(0);
    })
  .catch((error) => {
      console.dir("Error on cron job of scoring daily process: ");
      console.dir(error, {depth: null});
      process.exit(1);
    });