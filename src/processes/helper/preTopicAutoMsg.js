const momentTz = require('moment-timezone');
const {sample} = require('lodash');
const {automateWelcomeMsgQueue} = require('../../config');
const {LogError} = require('../../databases/models');

const preTopicAutoMsgProcess = async (returnPrepopulatedDm) => {
  try {
    let currentTime = momentTz().tz('America/Los_Angeles');

    const randomTime = sample([6, 7, 8]);
    const additionalDays = 1;
    let requiredTime = momentTz()
      .tz('America/Los_Angeles')
      .set({hour: randomTime})
      .add(additionalDays, 'days');

    console.log('currentTime', currentTime);
    console.log('requiredTime', requiredTime);

    const diffTime = requiredTime.diff(currentTime, 'milliseconds');

    console.log(':::run here new', diffTime);

    //await automateWelcomeMsgQueue.add(returnPrepopulatedDm, {delay: diffTime});

    return;
  } catch (error) {
    await LogError.create({
      message: error.message
    });
    console.error('error AutomateWelcomeMsgProcess: ', error);
  }
};

module.exports = {preTopicAutoMsgProcess};
