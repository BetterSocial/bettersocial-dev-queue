const register = require("./users-register");
const registerAnonymous = require("./users-register-anonymous");
const getUserTopicList = require("./get-user-topic-list");
const getUserFollowingList = require("./get-user-following-list");
const getUserFollowerList = require("./get-user-follower-list");
const getUserByUserId = require("./get-user-by-user-id");

const UsersFunction = {
  register,
  registerAnonymous,
  getUserTopicList,
  getUserFollowingList,
  getUserFollowerList,
  getUserByUserId,
};

module.exports = UsersFunction;
