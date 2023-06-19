const stream = require("getstream");

const followMainFeedF2 = async (userId, userIds) => {
  if (!userIds || userIds.length == 0) {
    return;
  }

  const cs = stream.connect(process.env.API_KEY, process.env.SECRET);

  const payload = userIds.map((ui) => {
    return {
      source: `main_feed_f2:${userId}`,
      target: `user_excl:${ui}`,
    };
  });
  return await cs.followMany(payload);
};

const unFollowMainFeedF2 = async (userId, userIds) => {
  if (!userIds || userIds.length == 0) {
    return;
  }

  const cs = stream.connect(process.env.API_KEY, process.env.SECRET);

  const payload = userIds.map((ui) => {
    return {
      source: `main_feed_f2:${userId}`,
      target: `user_excl:${ui}`,
    };
  });
  return await cs.unfollowMany(payload);
};


module.exports = {
  followMainFeedF2,
  unFollowMainFeedF2
};
