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
const {preAutomateWelcomeMsgProcess} = require('./helper/preAutoWelcomeMsg');

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

    if (process.env.AUTO_WLCM_MSG === 'true') {
      await preAutomateWelcomeMsgProcess(returnPrepopulatedDm);
    }

    await ProcessHelper.followUser(userId, follows);
    await ProcessHelper.createEmptyChannel(userId, follows);
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
