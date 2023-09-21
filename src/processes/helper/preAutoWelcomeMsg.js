const momentTz = require('moment-timezone');
const {sample} = require('lodash');
const {automateWelcomeMsgQueue} = require('../../config');
const {LogError} = require('../../databases/models');

const preAutomateWelcomeMsgProcess = async (returnPrepopulatedDm) => {
  try {
    let currentTime = momentTz().tz('America/Los_Angeles');
    let getCurrentTimeHour = currentTime.hours();

    let additionalDays = 0;
    if (parseInt(getCurrentTimeHour) > 6) {
      additionalDays = 1;
    }
    const randomTime = sample([6, 7, 8, 9]);
    let requiredTime = momentTz()
      .tz('America/Los_Angeles')
      .set({hour: randomTime})
      .add(additionalDays, 'days');

    console.log('currentTime', currentTime);
    console.log('requiredTime', requiredTime);

    const diffTime = requiredTime.diff(currentTime, 'miliseconds');
    returnPrepopulatedDm.resultPrepopulated = returnPrepopulatedDm.resultPrepopulated.filter(
      (results) => results.targetUser.username === process.env.USERNAME_ADMIN
    );

    await automateWelcomeMsgQueue.add(returnPrepopulatedDm, {delay: diffTime});

    return;
  } catch (error) {
    await LogError.create({
      message: error.message
    });
    console.error('error AutomateWelcomeMsgProcess: ', error);
  }
};

module.exports = {preAutomateWelcomeMsgProcess};
