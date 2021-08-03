const stream = require("getstream");
const followUser = async (token, userId, feedGroup, status = 1) => {
  const client = stream.connect(process.env.API_KEY, token, process.env.APP_ID);
  const user = client.feed("main_feed", client.userId, token);
  if (status === 1) {
    return user.follow(feedGroup, userId);
  } else {
    return user.unfollow(feedGroup, userId);
  }
};

const followUsers = async (token, userIds) => {
  const client = stream.connect(process.env.API_KEY, token, process.env.APP_ID);
  const clientServer = stream.connect(process.env.API_KEY, process.env.SECRET);
  const follows = [];
  userIds.map((item) => {
    follows.push({
      source: "main_feed:" + client.userId,
      target: "user:" + item.toLowerCase(),
    });
  });

  return await clientServer.followMany(follows);
};

module.exports = {
  followUser,
  followUsers,
};
