const Bull = require("bull");
const BetterSocialQueue = require("../redis/BetterSocialQueue")
const { QUEUE_NAME_CREDDER_SCORE, QUEUE_RSS,
  QUEUE_NAME_REFRESH_USER_FOLLOWER_COUNT_MATERIALIZED_VIEW, QUEUE_NAME_REFRESH_USER_TOPIC_MATERIALIZED_VIEW,
  QUEUE_NAME_REFRESH_USER_LOCATION_MATERIALIZED_VIEW, QUEUE_RSS_SECOND, QUEUE_NAME_ADD_QUEUE_POST_TIME, QUEUE_NAME_TEST,
  QUEUE_NAME_REFRESH_USER_COMMON_FOLLOWER_QUEUE_MATERIALIZED_VIEW, QUEUE_NAME_DELETE_EXPIRED_POST, QUEUE_NAME_DAILY_CREDDER_SCORE, QUEUE_ADD_USER_POST_COMMENT, QUEUE_DELETE_USER_POST_COMMENT, QUEUE_NAME_REGISTER_V2 } = require("../utils");

const connectRedis = process.env.REDIS_TLS_URL ? process.env.REDIS_TLS_URL : process.env.REDIS_URL;

// for production
const queueOptions = {
  redis: {
    tls: {
      rejectUnauthorized: false,
    }
  }
};

// for development
// const queueOptions = {};

/**
 * (START) List of queues that uses scoring redis
 */
const newsQueue = new Bull("newsQueue", connectRedis, queueOptions);
const registerQueue = new Bull("registerQueue", connectRedis, queueOptions);
const registerV2Queue = new Bull(QUEUE_NAME_REGISTER_V2, connectRedis, queueOptions);
const scoringProcessQueue = new Bull("scoringProcessQueue", connectRedis, queueOptions);
const scoringDailyProcessQueue = new Bull("scoringDailyProcessQueue", connectRedis, queueOptions);
const deleteActivityProcessQueue = new Bull("deleteActivityProcessQueue", connectRedis, queueOptions, {
  limiter: {
    max: 150,
    duration: 60 * 1000 // 60 second
  }
});
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
const postTimeQueue = BetterSocialQueue.generate(QUEUE_NAME_ADD_QUEUE_POST_TIME);
const refreshUserCommonFollowerMaterializedViewQueue = BetterSocialQueue.generate(QUEUE_NAME_REFRESH_USER_COMMON_FOLLOWER_QUEUE_MATERIALIZED_VIEW)
const refreshUserFollowerCountMaterializedViewQueue = BetterSocialQueue.generate(QUEUE_NAME_REFRESH_USER_FOLLOWER_COUNT_MATERIALIZED_VIEW)
const refreshUserLocationMaterializedViewQueue = BetterSocialQueue.generate(QUEUE_NAME_REFRESH_USER_LOCATION_MATERIALIZED_VIEW)
const refreshUserTopicMaterializedViewQueue = BetterSocialQueue.generate(QUEUE_NAME_REFRESH_USER_TOPIC_MATERIALIZED_VIEW)
const testQueue = BetterSocialQueue.generate(QUEUE_NAME_TEST);
/**
 * (END) of list of queues that uses general redis
 */

module.exports = {
  addUserPostCommentQueue,
  credderScoreQueue,
  dailyCredderUpdateQueue,
  dailyRssUpdateQueue,
  dailyRssUpdateQueueSecond,
  deleteActivityProcessQueue,
  deleteExpiredPost,
  deleteUserPostCommentQueue,
  newsQueue,
  postTimeQueue,
  refreshUserCommonFollowerMaterializedViewQueue,
  refreshUserFollowerCountMaterializedViewQueue,
  refreshUserLocationMaterializedViewQueue,
  refreshUserTopicMaterializedViewQueue,
  registerQueue,
  registerV2Queue,
  scoringDailyProcessQueue,
  scoringProcessQueue,
  testQueue,
};