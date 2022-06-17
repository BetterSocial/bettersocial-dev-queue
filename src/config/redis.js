const Bull = require("bull");
const BetterSocialQueue = require("../redis/BetterSocialQueue")
const { QUEUE_NAME_CREDDER_SCORE, QUEUE_NAME_WEEKLY_CREDDER_SCORE, QUEUE_RSS, 
  QUEUE_NAME_REFRESH_USER_FOLLOWER_COUNT_MATERIALIZED_VIEW, QUEUE_NAME_REFRESH_USER_TOPIC_MATERIALIZED_VIEW, 
  QUEUE_NAME_REFRESH_USER_LOCATION_MATERIALIZED_VIEW, QUEUE_RSS_SECOND, QUEUE_NAME_ADD_QUEUE_POST_TIME, QUEUE_NAME_TEST } = require("../utils");



const connectRedis = process.env.REDIS_URL;

// for production
const queueOptions = {
  redis: { tls: { rejectUnauthorized: false, requestCert: true, } }
};

// for development
// const queueOptions = {};

/**
 * (START) List of queues that uses scoring redis
 */
const newsQueue = new Bull("newsQueue", connectRedis, queueOptions);
const registerQueue = new Bull("registerQueue", connectRedis, queueOptions);
const scoringProcessQueue = new Bull("scoringProcessQueue", connectRedis, queueOptions);
const scoringDailyProcessQueue = new Bull("scoringDailyProcessQueue", connectRedis, queueOptions);
/**
 * (END) of list of queues that uses scoring redis
 */


/**
 * (START) List of queues that uses general redis
 */
const credderScoreQueue = BetterSocialQueue.generate(QUEUE_NAME_CREDDER_SCORE);
const dailyRssUpdateQueue = BetterSocialQueue.generate(QUEUE_RSS)
const dailyRssUpdateQueueSecond = BetterSocialQueue.generate(QUEUE_RSS_SECOND)
const postTimeQueue = BetterSocialQueue.generate(QUEUE_NAME_ADD_QUEUE_POST_TIME);
const refreshUserFollowerCountMaterializedViewQueue = BetterSocialQueue.generate(QUEUE_NAME_REFRESH_USER_FOLLOWER_COUNT_MATERIALIZED_VIEW)
const refreshUserLocationMaterializedViewQueue = BetterSocialQueue.generate(QUEUE_NAME_REFRESH_USER_LOCATION_MATERIALIZED_VIEW)
const refreshUserTopicMaterializedViewQueue = BetterSocialQueue.generate(QUEUE_NAME_REFRESH_USER_TOPIC_MATERIALIZED_VIEW)
const testQueue = BetterSocialQueue.generate(QUEUE_NAME_TEST);
const weeklyCredderUpdateQueue = BetterSocialQueue.generate(QUEUE_NAME_WEEKLY_CREDDER_SCORE);
/**
 * (END) of list of queues that uses general redis
 */

module.exports = {
  credderScoreQueue,
  newsQueue,
  postTimeQueue,
  registerQueue,
  scoringDailyProcessQueue,
  scoringProcessQueue,
  testQueue,
  weeklyCredderUpdateQueue,
  dailyRssUpdateQueue,
  refreshUserFollowerCountMaterializedViewQueue,
  refreshUserTopicMaterializedViewQueue,
  refreshUserLocationMaterializedViewQueue,
  dailyRssUpdateQueueSecond
};