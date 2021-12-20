const stream = require("getstream");
const UserService = require("./postgres/UserService");
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
  try {

    const client = stream.connect(process.env.API_KEY, token, process.env.APP_ID);
    const clientServer = stream.connect(process.env.API_KEY, process.env.SECRET);
    const userSevice = new UserService();
    let userAdmin = await userSevice.getUserAdmin(process.env.USERNAME_ADMIN);
    let id = userAdmin.user_id;
    console.log('id admin', id);
    userIds.push(id);
    const follows = [];
    userIds.map((item) => {
      follows.push({
        source: "main_feed:" + client.userId,
        target: "user:" + item.toLowerCase(),
      });
    });

    const res = await clientServer.followMany(follows);
    console.log(res);
    return res;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

module.exports = {
  followUser,
  followUsers,
};
