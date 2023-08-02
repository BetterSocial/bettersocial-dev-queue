const stream = require("getstream");
const { unFollowFeedProcessQueue } = require("../config");

const followMainFeedF2 = async (userId, userIds) => {
  console.log("F2 => ", userIds)
  if (!userIds || userIds.length == 0) {
    return;
  }

  const cs = stream.connect(process.env.API_KEY, process.env.SECRET);

  const payload = userIds.map((ui) => {
    return {
      source: `main_feed_f2:${userId}`,
      target: `user:${ui}`,
    };
  });
  return await cs.followMany(payload);
};

const unFollowMainFeedF2 = async (userId, userIds) => {
  if (!userIds || userIds.length == 0) {
    return;
  }

  userIds.map(async (ui) => {
    // sent job to queue to avoid rate limit
    unFollowFeedProcessQueue.add({
      feedName: "main_feed_f2",
      userId: userId,
      targetFeed: "user",
      unfollowUserId: ui,
    });
  });
  return;
};


module.exports = {
  followMainFeedF2,
  unFollowMainFeedF2
};
