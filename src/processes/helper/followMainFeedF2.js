const { followMainFeedF2 } = require("../../services");
const { LogError } = require("../../databases/models");

const follow = async (userId, userIds) => {
  try {
    await followMainFeedF2(userId, userIds);
  } catch (error) {
    await LogError.create({
      message: error.message,
    });
    console.error("followMainFeedF2: ", error);
  }
};

module.exports = follow;
