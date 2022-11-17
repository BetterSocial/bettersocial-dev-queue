module.exports = {
    DOMAIN: "domain",

    CHANNEL_TYPE_PERSONAL: 0,
    CHANNEL_TYPE_GROUP: 1,
    CHANNEL_TYPE_GROUP_LOCATION: 2,
    CHANNEL_TYPE_TOPIC: 3,

    ICON_TOPIC_CHANNEL: "https://res.cloudinary.com/hpjivutj2/image/upload/v1636632905/vdg8solozeepgvzxyfbv.png",
    ICON_LOCATION_CHANNEL: "https://res.cloudinary.com/hpjivutj2/image/upload/v1637078306/fkeyjmvxoeme6nqyp00z.png",
    ICON_GROUP_CHANNEL: "https://res.cloudinary.com/hpjivutj2/image/upload/v1636633216/ru8itxe3erw7vuy42vv7.png",

    QUEUE_NAME_ADD_QUEUE_POST_TIME: 'addQueuePostTime',
    QUEUE_NAME_CREDDER_SCORE: 'credderScoreQueue',
    QUEUE_NAME_DAILY_CREDDER_SCORE: 'dailyCredderScoreQueue',
    QUEUE_NAME_REFRESH_USER_FOLLOWER_COUNT_MATERIALIZED_VIEW: 'refreshUserFollowerCountMaterializedView',
    QUEUE_NAME_REFRESH_USER_TOPIC_MATERIALIZED_VIEW: 'refreshUserTopicMaterializedView',
    QUEUE_NAME_REFRESH_USER_LOCATION_MATERIALIZED_VIEW: 'refreshUserLocationMaterializedView',
    QUEUE_NAME_REFRESH_USER_COMMON_FOLLOWER_QUEUE_MATERIALIZED_VIEW: 'refreshUserCommonFollowerQueueMaterializedView',
    QUEUE_NAME_DELETE_EXPIRED_POST: 'deleteExpiredPost',
    QUEUE_NAME_TEST: 'testQueue',
    QUEUE_CREDDER_INTERVAL_IN_DAYS: 3,

    CREDDER_SCORE_NOT_INDEXED: -1,
    CREDDER_SCORE_NOT_VALID: -2,

    QUEUE_RSS: 'queueRss',
    QUEUE_RSS_SECOND: 'queueRssSecond',

    PREFIX_TOPIC: 'topic_',
    DAY_IN_SECONDS: 24 * 60 * 60,
};
