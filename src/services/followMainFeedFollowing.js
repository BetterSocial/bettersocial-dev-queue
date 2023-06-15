const stream = require("getstream");

const followMainFeedFollowing = async (userId, userIds) => {
  if (!userIds || userIds.length == 0) {
    return;
  }

  const cs = stream.connect(process.env.API_KEY, process.env.SECRET);
  const userAdmin = await userSevice.getUserAdmin(process.env.USERNAME_ADMIN);

  userIds.push(userAdmin.user_id);
  const payload = userIds.map((ui) => {
    return {
      source: `main_feed_following:${userId}`,
      target: `user_excl:${ui}`,
    };
  });
  return await cs.followMany(payload);
};

module.exports = {
  followMainFeedFollowing,
};
