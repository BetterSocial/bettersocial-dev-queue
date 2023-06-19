const { unFollowMainFeedF2 } = require("../../services");
const { LogError } = require("../../databases/models");

const unfollow = async (userId, userIds) => {
  try {
    await unFollowMainFeedF2(userId, userIds);
  } catch (error) {
    await LogError.create({
      message: error.message,
    });
    console.error("unfollowMainFeedF2: ", error);
  }
};

module.exports = unfollow;
