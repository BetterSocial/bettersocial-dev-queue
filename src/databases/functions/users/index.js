const register = require('./users-register');
const registerAnonymous = require('./users-register-anonymous');
const getUserTopicList = require('./get-user-topic-list');
const getUserFollowingList = require('./get-user-following-list');
const getUserFollowerList = require('./get-user-follower-list');
const getUserByUserId = require('./get-user-by-user-id');
const userBlockByAdmin = require('./user-block-by-admin');
const userUnblockByAdmin = require('./user-unblock-by-admin');
const findAnonymousUserId = require('./find-anonymous-user-id');
const findSignedUserId = require('./find-signed-user-id');
const userSetKarmaScore = require('./user-set-karma-score');
const setAllFollowerCount = require('./set-all-follower-count');

const UsersFunction = {
  register,
  registerAnonymous,
  getUserTopicList,
  getUserFollowingList,
  getUserFollowerList,
  getUserByUserId,
  userBlockByAdmin,
  userUnblockByAdmin,
  findAnonymousUserId,
  findSignedUserId,
  userSetKarmaScore,
  setAllFollowerCount
};

module.exports = UsersFunction;
