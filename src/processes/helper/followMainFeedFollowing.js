const { followMainFeedFollowing } = require("../../services");
const { LogError } = require("../../databases/models");

const followMainFeedFollowing = async (userId, userIds) => {
  try {
    await followMainFeedFollowing(userId, userIds);
  } catch (error) {
    await LogError.create({
      message: error.message,
    });
    console.error("followUser: ", error);
  }
};

module.exports = followMainFeedFollowing;
