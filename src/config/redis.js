const Bull = require('bull');
const BetterSocialQueue = require('../redis/BetterSocialQueue');
const {
  EVENT_FOLLOW_F2_USER,
  EVENT_UNFOLLOW_F2_USER,
  QUEUE_ADD_USER_POST_COMMENT,
  QUEUE_DELETE_USER_POST_COMMENT,
  QUEUE_GENERAL_DAILY,
  QUEUE_NAME_CREDDER_SCORE,
  QUEUE_NAME_REGISTER_V2,
  QUEUE_NEWS,
  QUEUE_SCORING_PROCESS,
  QUEUE_SCORING_DAILY_PROCESS,
  QUEUE_DELETE_ACTIVITY_PROCESS,
  QUEUE_UNFOLLOW_FEED_PROCESS,
  QUEUE_UPDATE_MAIN_FEED_BROAD_PROCESS,
  QUEUE_SYNC_USER_FEED
} = require('../utils');
const BetterSocialCronQueue = require('../redis/BetterSocialCronQueue');
const {bullConfig, redisCredentials} = require('../redis/MainConfig');

/**
 * (START) List of queues that uses scoring redis
 */
const newsQueue = new Bull(QUEUE_NEWS, redisCredentials, bullConfig);
const registerV2Queue = new Bull(QUEUE_NAME_REGISTER_V2, redisCredentials, bullConfig);
const scoringProcessQueue = new Bull(QUEUE_SCORING_PROCESS, redisCredentials, bullConfig);
const scoringDailyProcessQueue = new Bull(
  QUEUE_SCORING_DAILY_PROCESS,
  redisCredentials,
  bullConfig
);
const deleteActivityProcessQueue = new Bull(
  QUEUE_DELETE_ACTIVITY_PROCESS,
  redisCredentials,
  bullConfig,
  {
    limiter: {
      max: 150,
      duration: 60 * 1000 // 60 second
    }
  }
);
const unFollowFeedProcessQueue = new Bull(
  QUEUE_UNFOLLOW_FEED_PROCESS,
  redisCredentials,
  bullConfig,
  {
    limiter: {
      max: 250,
      duration: 60 * 1000 // 60 second
    }
  }
);
const updateMainFeedBroadProcessQueue = new Bull(
  QUEUE_UPDATE_MAIN_FEED_BROAD_PROCESS,
  redisCredentials,
  bullConfig
);
const syncUserFeedQueue = new Bull(QUEUE_SYNC_USER_FEED, redisCredentials, bullConfig);
/**
 * (END) of list of queues that uses scoring redis
 */

/**
 * (START) List of queues that uses general redis
 */
const addUserPostCommentQueue = BetterSocialQueue.generate(QUEUE_ADD_USER_POST_COMMENT);
const credderScoreQueue = BetterSocialQueue.generate(QUEUE_NAME_CREDDER_SCORE);
const deleteUserPostCommentQueue = BetterSocialQueue.generate(QUEUE_DELETE_USER_POST_COMMENT);
const followMainFeedF2 = BetterSocialQueue.generate(EVENT_FOLLOW_F2_USER);
const unFollowMainFeedF2 = BetterSocialQueue.generate(EVENT_UNFOLLOW_F2_USER);

const generalDailyQueue = BetterSocialCronQueue.generate(QUEUE_GENERAL_DAILY);

/**
 * (END) of list of queues that uses general redis
 */

module.exports = {
  addUserPostCommentQueue,
  credderScoreQueue,
  deleteActivityProcessQueue,
  deleteUserPostCommentQueue,
  newsQueue,
  registerV2Queue,
  scoringDailyProcessQueue,
  scoringProcessQueue,
  followMainFeedF2,
  unFollowMainFeedF2,
  unFollowFeedProcessQueue,
  updateMainFeedBroadProcessQueue,
  syncUserFeedQueue,
  generalDailyQueue
};
