const UsersFunction = {
  register: require("./users-register"),
  registerAnonymous: require("./users-register-anonymous"),
  getUserTopicList: require("./get-user-topic-list"),
  getUserFollowingList: require("./get-user-following-list"),
  getUserFollowerList: require("./get-user-follower-list"),
  getUserByUserId: require("./get-user-by-user-id"),
};

module.exports = UsersFunction;
