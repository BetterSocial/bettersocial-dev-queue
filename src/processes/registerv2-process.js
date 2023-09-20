const {convertingUserFormatForLocation} = require('../utils/custom');

const {LogError} = require('../databases/models');
const UserLocationFunction = require('../databases/functions/userLocation');
const UserTopicFunction = require('../databases/functions/userTopic');
const UserFollowUserFunction = require('../databases/functions/userFollowUser');
const momentTz = require('moment-timezone');
const {sample} = require('lodash');

const {
  Locations,
  UserFollowUser,
  UserFollowUserHistory,
  UserLocationHistory,
  UserLocation,
  UserTopic,
  UserTopicHistory
} = require('../databases/models');
const LocationFunction = require('../databases/functions/location');
const {addUserToTopicChannel} = require('./helper');
const ProcessHelper = require('./helper');
const {automateWelcomeMsgQueue} = require('../config');

const {syncFeedPerUserProcess} = require('../services/syncFeedPerUser');

const registerProcess = async (job, done) => {
  try {
    console.info('running job register process ! with id ' + job.id);
    let data = job.data;
    let {userId, follows, topics, anonUserId, locations} = data;

    const locationIds = locations.map((item) => item?.location_id);
    await UserLocationFunction.registerUserLocation(
      UserLocation,
      UserLocationHistory,
      userId,
      locationIds
    );

    const topicIds = topics.map((item) => item?.topic_id);
    const topicNames = topics.map((item) => item?.name);
    await UserTopicFunction.registerUserTopic(UserTopic, UserTopicHistory, userId, topicIds);

    await UserFollowUserFunction.registerAddFollowUser(
      UserFollowUser,
      UserFollowUserHistory,
      userId,
      follows,
      'onboarding'
    );

    const locationResult = await LocationFunction.findAllLocationByLocationIds(
      Locations,
      locationIds,
      null,
      true
    );

    const result = {
      locations: convertingUserFormatForLocation(locationResult)
    };

    await ProcessHelper.followDefaultLocation(userId);
    const returnPrepopulatedDm = await ProcessHelper.prepopulatedDm(userId, follows);

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

    await ProcessHelper.followUser(userId, follows);
    await ProcessHelper.followAnonymousUser(anonUserId, follows);
    await ProcessHelper.followTopic(userId, topics);
    await ProcessHelper.followLocation(userId, result?.locations);
    await ProcessHelper.addUserToTopicChannel(userId, topicNames);
    await ProcessHelper.followMainFeedTopic(userId, topicNames);
    await ProcessHelper.followMainFeedFollowing(userId, follows);
    await syncFeedPerUserProcess(userId);
    await LogError.create({
      message: `done register process userId: ${userId}`
    });
    done(null, 'ok');
  } catch (error) {
    console.error(error);
    await LogError.create({
      message: error.message
    });
    done(null, error);
  }
};

module.exports = {
  registerProcess,
  addUserToTopicChannel
};
