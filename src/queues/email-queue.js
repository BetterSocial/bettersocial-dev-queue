// const { emailProcess } = require("../processes/email-process");
// const { setQueues, BullAdapter } = require("bull-board");
// const { emailQueue } = require('../config');

// setQueues([new BullAdapter(emailQueue)]);

// emailQueue.process(emailProcess);

// const sendNewEmail = (data) => {
//   emailQueue.add(data, {
//     attempts: 5,
//   });
// };

// module.exports = { sendNewEmail };
