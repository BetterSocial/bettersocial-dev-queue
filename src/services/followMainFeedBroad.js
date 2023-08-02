const stream = require("getstream");
const { unFollowFeedProcessQueue } = require("../config");

const followMainFeedBroad = async (userId, userIds) => {
  console.log("Broad Feed => ", userIds)
  if (!userIds || userIds.length == 0) {
    return;
  }

  const cs = stream.connect(process.env.API_KEY, process.env.SECRET);

  const payload = userIds.map((ui) => {
    return {
      source: `main_feed_broad:${userId}`,
      target: `user:${ui}`,
    };
  });
  return await cs.followMany(payload);
};

const unFollowMainFeedBroad = async (userId, userIds) => {
  if (!userIds || userIds.length == 0) {
    return;
  }

  userIds.map(async (ui) => {
    // sent job to queue to avoid rate limit
    unFollowFeedProcessQueue.add({
      feedName: "main_feed_broad",
      userId: userId,
      targetFeed: "user",
      unfollowUserId: ui,
    });
  });
  return;
};


module.exports = {
  followMainFeedBroad,
  unFollowMainFeedBroad
};
