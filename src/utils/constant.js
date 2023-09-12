module.exports = {
  DOMAIN: 'domain',

  CHANNEL_TYPE_PERSONAL: 0,
  CHANNEL_TYPE_GROUP: 1,
  CHANNEL_TYPE_GROUP_LOCATION: 2,
  CHANNEL_TYPE_TOPIC: 3,

  ICON_TOPIC_CHANNEL:
    'https://res.cloudinary.com/hpjivutj2/image/upload/v1636632905/vdg8solozeepgvzxyfbv.png',
  ICON_LOCATION_CHANNEL:
    'https://res.cloudinary.com/hpjivutj2/image/upload/v1637078306/fkeyjmvxoeme6nqyp00z.png',
  ICON_GROUP_CHANNEL:
    'https://res.cloudinary.com/hpjivutj2/image/upload/v1636633216/ru8itxe3erw7vuy42vv7.png',

  QUEUE_ADD_USER_POST_COMMENT: 'addUserPostComment',
  QUEUE_CREDDER_INTERVAL_IN_DAYS: 3,
  QUEUE_DELETE_ACTIVITY_PROCESS: 'deleteActivityProcessQueue',
  QUEUE_DELETE_USER_POST_COMMENT: 'deleteUserPostComment',
  QUEUE_GENERAL_DAILY: 'generalDaily',
  QUEUE_NAME_CREDDER_SCORE: 'credderScoreQueue',
  QUEUE_NAME_REGISTER_V2: 'registerV2',
  QUEUE_NAME_TEST: 'testQueue',
  QUEUE_NEWS: 'newsQueue',
  QUEUE_SCORING_DAILY_PROCESS: 'scoringDailyProcessQueue',
  QUEUE_SCORING_PROCESS: 'scoringProcessQueue',
  QUEUE_SYNC_USER_FEED: 'syncUserFeedQueue',
  QUEUE_UNFOLLOW_FEED_PROCESS: 'unFollowFeedProcessQueue',
  QUEUE_UPDATE_MAIN_FEED_BROAD_PROCESS: 'updateMainFeedBroadProcessQueue',
  QUEUE_REMOVE_ACTIVITY: 'removeActivityQueue',

  CREDDER_SCORE_NOT_INDEXED: -1,
  CREDDER_SCORE_NOT_VALID: -2,

  PREFIX_TOPIC: 'topic_',
  DAY_IN_SECONDS: 24 * 60 * 60,

  EVENT_FOLLOW_F2_USER: 'follow-f2-users',
  EVENT_UNFOLLOW_F2_USER: 'unfollow-f2-users'
};
