const stream = require("getstream");
const UserService = require("./postgres/UserService");
const sequelize = require("../databases/models").sequelize;
const {
  UserFollowUser,
  UserFollowUserHistory } = require("../databases/models");
const { v4: uuidv4 } = require("uuid");

const followUser = async (token, userId, feedGroup, status = 1) => {
  const client = stream.connect(process.env.API_KEY, token, process.env.APP_ID);
  const user = client.feed("main_feed", userId, token);
  if (status === 1) {
    return user.follow(feedGroup, userId);
  } else {
    return user.unfollow(feedGroup, userId);
  }
};

const followUsers = async (userId, userIds) => {
  try {
    const result = await sequelize.transaction(async (t) => {
      const clientServer = stream.connect(process.env.API_KEY, process.env.SECRET);
      const userSevice = new UserService();
      let userAdmin = await userSevice.getUserAdmin(process.env.USERNAME_ADMIN);
      let id = userAdmin.user_id;
      // User Follow User
      let followUser = {
        //   generate UUID
        follow_action_id: uuidv4(),
        user_id_follower: userId,
        user_id_followed: id,
      };

      await UserFollowUser.create(
        followUser,
        {
          transaction: t,
          returning: true,
        }
      );

      let user_follow_user_return = {
        user_id_follower: userId,
        user_id_followed: id,
        action: "in",
        source: 'onboarding',
      };
      await UserFollowUserHistory.create(user_follow_user_return, {
        transaction: t,
      });

      userIds.push(id);
      const follows = [];
      userIds.map((item) => {
        follows.push({
          source: "main_feed_following:" + item.toLowerCase(),
          target: "user:" + userId,
        });
      });

      const res = await clientServer.followMany(follows);
      return res;
    })
    return result;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

const makeTargetsFollowMyAnonymousUser = async (myAnonUserId, targets) => {
  try {
    const result = await sequelize.transaction(async (t) => {
      const clientServer = stream.connect(process.env.API_KEY, process.env.SECRET);
      const userSevice = new UserService();
      let userAdmin = await userSevice.getUserAdmin(process.env.USERNAME_ADMIN);
      let id = userAdmin.user_id;
      // User Follow User
      targets.push(id);
      const follows = [];
      targets.map((target) => {
        follows.push({
          source: "main_feed_following:" + target.toLowerCase(),
          target: "user_anon:" + myAnonUserId,
        });
      });

      const res = await clientServer.followMany(follows);
      return res;
    })
    return result;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

module.exports = {
  followUser,
  followUsers,
  makeTargetsFollowMyAnonymousUser
};
