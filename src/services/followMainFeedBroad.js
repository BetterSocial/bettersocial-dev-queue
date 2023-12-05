const stream = require('getstream');
const {unFollowFeedProcessQueue} = require('../config');

const followMainFeedBroad = async (userId, userIds, user_anon = false) => {
  console.log('Broad Feed => ', userIds);
  if (!userIds || userIds.length === 0) {
    return;
  }
  const targetFeed = user_anon ? 'user_anon' : 'user';
  const cs = stream.connect(process.env.API_KEY, process.env.SECRET);

  const payload = userIds.map((ui) => {
    return {
      source: `main_feed_broad:${userId}`,
      target: `${targetFeed}:${ui}`
    };
  });
  await cs.followMany(payload);
};

const unFollowMainFeedBroad = async (userId, userIds, user_anon = false) => {
  if (!userIds || userIds.length === 0) {
    return;
  }

  const targetFeed = user_anon ? 'user_anon' : 'user';
  userIds.map(async (ui) => {
    // sent job to queue to avoid rate limit
    unFollowFeedProcessQueue.add({
      feedName: 'main_feed_broad',
      userId,
      targetFeed,
      unfollowUserId: ui
    });
  });
};

module.exports = {
  followMainFeedBroad,
  unFollowMainFeedBroad
};
