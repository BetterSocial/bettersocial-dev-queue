const addUserToLocationChannel = require('./addUserToLocationChannel');
const addUserToTopicChannel = require('./addUserToTopicChannel');
const followAnonymousUser = require('./followAnonymousUser');
const followDefaultLocation = require('./followDefaultLocation');
const followLocation = require('./followLocation');
const followUser = require('./followUser');
const createEmptyChannel = require('./createEmptyChannel');
const followTopic = require('./followTopic');
const prepopulatedDm = require('./prepopulatedDm');
const followMainFeedTopic = require('./followMainFeedTopic');
const followMainFeedFollowing = require('./followMainFeedFollowing');
const followMainFeedF2 = require('./followMainFeedF2');
const unFollowMainFeedF2 = require('./unFollowMainFeedF2');

const ProcessHelper = {
  addUserToLocationChannel,
  addUserToTopicChannel,
  followAnonymousUser,
  followDefaultLocation,
  followLocation,
  followUser,
  followTopic,
  prepopulatedDm,
  followMainFeedTopic,
  followMainFeedFollowing,
  followMainFeedF2,
  unFollowMainFeedF2,
  createEmptyChannel
};

module.exports = ProcessHelper;
