const Bull = require("bull");
const { emailProcess } = require("../processes/email-process");
const { setQueues, BullAdapter } = require("bull-board");

// https://optimalbits.github.io/bull

const emailQueue = new Bull("email", {
  // redis: "redis://127.0.0.1:6379",
  redis: process.env.REDIS_URL || process.env.REDIS_TLS_URL,
});

setQueues([new BullAdapter(emailQueue)]);

emailQueue.process(emailProcess);

const sendNewEmail = (data) => {
  emailQueue.add(data, {
    attempts: 5,
  });
};

module.exports = { sendNewEmail };
