const Bull = require("bull");
const BetterSocialQueue = require("../redis/BetterSocialQueue")
const Redis = require('ioredis');
const { QUEUE_NAME_CREDDER_SCORE, QUEUE_RSS,
  QUEUE_NAME_REFRESH_USER_FOLLOWER_COUNT_MATERIALIZED_VIEW, QUEUE_NAME_REFRESH_USER_TOPIC_MATERIALIZED_VIEW,
  QUEUE_NAME_REFRESH_USER_LOCATION_MATERIALIZED_VIEW, QUEUE_RSS_SECOND, QUEUE_NAME_ADD_QUEUE_POST_TIME, QUEUE_NAME_TEST,
  QUEUE_NAME_REFRESH_USER_COMMON_FOLLOWER_QUEUE_MATERIALIZED_VIEW, QUEUE_NAME_DELETE_EXPIRED_POST, QUEUE_NAME_DAILY_CREDDER_SCORE, QUEUE_ADD_USER_POST_COMMENT, QUEUE_DELETE_USER_POST_COMMENT, QUEUE_NAME_REGISTER_V2, QUEUE_NAME_REFRESH_ALL_MATERIALIZED_VIEW, EVENT_FOLLOW_F2_USER, EVENT_UNFOLLOW_F2_USER } = require("../utils");

const redisUrl = process.env.REDIS_TLS_URL
const IS_LOCAL_REDIS = false;

const redisConfig = IS_LOCAL_REDIS
  ? {}
  : {
      tls: {
        rejectUnauthorized: false
        // requestCert: true,
        // agent: false
      }
    };

const redisClient = new Redis(String(redisUrl), redisConfig);

const bullConfig = IS_LOCAL_REDIS
  ? {}
  : {
      tls: {
        rejectUnauthorized: false
        // requestCert: true
      }
    };

module.exports = {
  redisClient,
  bullConfig,
  redisUrl
};

/**
 * (START) List of queues that uses scoring redis
 */
const newsQueue = new Bull("newsQueue", redisUrl, bullConfig);
const registerV2Queue = new Bull(QUEUE_NAME_REGISTER_V2, redisUrl, bullConfig);
const scoringProcessQueue = new Bull("scoringProcessQueue", redisUrl, bullConfig);
const scoringDailyProcessQueue = new Bull("scoringDailyProcessQueue", redisUrl, bullConfig);
const deleteActivityProcessQueue = new Bull("deleteActivityProcessQueue", redisUrl, bullConfig, {
  limiter: {
    max: 150,
    duration: 60 * 1000 // 60 second
  }
});
const unFollowFeedProcessQueue = new Bull("unFollowFeedProcessQueue", redisUrl, bullConfig, {
  limiter: {
    max: 250,
    duration: 60 * 1000 // 60 second
  }
});
const updateMainFeedBroadProcessQueue = new Bull("updateMainFeedBroadProcessQueue", redisUrl, bullConfig);
const syncUserFeedQueue = new Bull("syncUserFeedQueue", redisUrl, bullConfig);
/**
 * (END) of list of queues that uses scoring redis
 */


/**
 * (START) List of queues that uses general redis
 */
const addUserPostCommentQueue = BetterSocialQueue.generate(QUEUE_ADD_USER_POST_COMMENT)
const credderScoreQueue = BetterSocialQueue.generate(QUEUE_NAME_CREDDER_SCORE);
const dailyCredderUpdateQueue = BetterSocialQueue.generate(QUEUE_NAME_DAILY_CREDDER_SCORE);
const dailyRssUpdateQueue = BetterSocialQueue.generate(QUEUE_RSS)
const dailyRssUpdateQueueSecond = BetterSocialQueue.generate(QUEUE_RSS_SECOND)
const deleteExpiredPost = BetterSocialQueue.generate(QUEUE_NAME_DELETE_EXPIRED_POST)
const deleteUserPostCommentQueue = BetterSocialQueue.generate(QUEUE_DELETE_USER_POST_COMMENT)
const refreshMaterializedViewQueue = BetterSocialQueue.generate(QUEUE_NAME_REFRESH_ALL_MATERIALIZED_VIEW)
const followMainFeedF2 = BetterSocialQueue.generate(EVENT_FOLLOW_F2_USER);
const unFollowMainFeedF2 = BetterSocialQueue.generate(EVENT_UNFOLLOW_F2_USER);
/**
 * (END) of list of queues that uses general redis
 */

module.exports = {
  bullConfig,
  redisClient,
  redisUrl,
  addUserPostCommentQueue,
  credderScoreQueue,
  dailyCredderUpdateQueue,
  dailyRssUpdateQueue,
  dailyRssUpdateQueueSecond,
  deleteActivityProcessQueue,
  deleteExpiredPost,
  deleteUserPostCommentQueue,
  newsQueue,
  refreshMaterializedViewQueue,
  registerV2Queue,
  scoringDailyProcessQueue,
  scoringProcessQueue,
  followMainFeedF2,
  unFollowMainFeedF2,
  unFollowFeedProcessQueue,
  updateMainFeedBroadProcessQueue,
  syncUserFeedQueue
};
