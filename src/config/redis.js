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
  QUEUE_SYNC_USER_FEED,
  QUEUE_REMOVE_ACTIVITY
} = require('../utils');
const BetterSocialCronQueue = require('../redis/BetterSocialCronQueue');
const {bullConfig, redisUrl} = require('../redis/MainConfig');

/**
 * (START) List of queues that uses scoring redis
 */
const newsQueue = new Bull(QUEUE_NEWS, redisUrl, bullConfig);
const registerV2Queue = new Bull(QUEUE_NAME_REGISTER_V2, redisUrl, bullConfig);
const scoringProcessQueue = new Bull(QUEUE_SCORING_PROCESS, redisUrl, bullConfig);
const scoringDailyProcessQueue = new Bull(QUEUE_SCORING_DAILY_PROCESS, redisUrl, bullConfig);
const deleteActivityProcessQueue = new Bull(QUEUE_DELETE_ACTIVITY_PROCESS, redisUrl, bullConfig, {
  limiter: {
    max: 150,
    duration: 60 * 1000 // 60 second
  }
});
const unFollowFeedProcessQueue = new Bull(QUEUE_UNFOLLOW_FEED_PROCESS, redisUrl, bullConfig, {
  limiter: {
    max: 250,
    duration: 60 * 1000 // 60 second
  }
});
const removeActivityQueue = new Bull(QUEUE_REMOVE_ACTIVITY, redisUrl, bullConfig, {
  limiter: {
    max: 300,
    duration: 60 * 1000 // 60 second
  }
});

const updateMainFeedBroadProcessQueue = new Bull(
  QUEUE_UPDATE_MAIN_FEED_BROAD_PROCESS,
  redisUrl,
  bullConfig
);
const syncUserFeedQueue = new Bull(QUEUE_SYNC_USER_FEED, redisUrl, bullConfig);
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
  generalDailyQueue,
  removeActivityQueue
};
