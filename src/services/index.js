module.exports = {
  ...require("./postStream"),
  ...require("./updateStream"),
  ...require("./refreshPostViewTime"),
  ...require("./followLocation"),
  ...require("./followUser"),
  ...require("./followTopic"),
  ...require("./deleteStream"),
  ...require("./followMainFeedFollowing"),
  ...require("./followMainFeedF2"),
  ...require("./syncFeedPerUser"),
  ...require("./getStreamActivities")
};
