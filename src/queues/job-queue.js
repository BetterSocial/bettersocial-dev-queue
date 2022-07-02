const { newsJob } = require("../processes/news-process");
const { createPostTime } = require("../processes/post-time-process");
const { scoringProcessJob } = require("../processes/scoring-process");
const {
  scoringDailyProcessJob,
} = require("../processes/scoring-daily-process");
const {
  followLocation,
  followTopic,
  followUser,
} = require("../processes/follow-location-process");
const {
  handlerFailure,
  handlerCompleted,
  handlerStalled,
} = require("./handler");

const {
  addUserToChannelQueue,
  addUserToTopicChannelQueue,
  followTopicQueue,
  followUserQueue,
  locationQueue,
  newsQueue,
  postTimeQueue,
  prepopulatedDmQueue,
  registerQueue,
  scoringDailyProcessQueue,
  scoringProcessQueue,
  testQueue,
  credderScoreQueue,
  weeklyCredderUpdateQueue,
  dailyRssUpdateQueue,
  refreshUserFollowerCountMaterializedViewQueue,
  refreshUserTopicMaterializedViewQueue,
  refreshUserLocationMaterializedViewQueue,
  dailyRssUpdateQueueSecond,
  refreshUserCommonFollowerMaterializedViewQueue,
} = require("../config");

const {
  addUserToChannel,
  addUserToTopicChannel,
} = require("../processes/chat-process");
const { prepopulatedDm } = require("../processes/prepopulate-dm-process");
const { registerProcess } = require("../processes/register-process");
const { testProcess } = require("../processes/test-process");
const { updateDomainCredderScore } = require("../utils");
const { credderScoreProcess } = require("../processes/credder-score-process");
const {
  credderWeeklyScoreProcess,
} = require("../processes/credder-weekly-score-process");
const { rssProcess } = require("../processes/rss-process");
const {
  refreshUserFollowerCount,
} = require("../processes/refresh-user-follower-count-process");
const {
  refreshUserTopicFollower,
} = require("../processes/refresh-user-topic-process");
const {
  refreshUserLocationFollower,
} = require("../processes/refresh-user-location-process");
const BetterSocialQueue = require("../redis/BetterSocialQueue");
const {
  refreshUserCommonFollowerMaterializedViewProcess,
} = require("../processes/refresh-user-common-follower-count-process");

/*
  @description initial all job queue
*/
const initQueue = () => {
  console.info("newsQueue job is working!");
  newsQueue.process(newsJob);
  newsQueue.on("failed", handlerFailure);
  newsQueue.on("completed", handlerCompleted);
  newsQueue.on("stalled", handlerStalled);
  newsQueue.on("error", (err) => {
    console.log("newsQueue error : ", err);
  });
  newsQueue.on("active", (res) => {
    console.log(res);
  });

  console.log("Register Queue job is working");
  registerQueue.process(registerProcess);
  registerQueue.on("failed", handlerFailure);
  registerQueue.on("completed", handlerCompleted);
  registerQueue.on("stalled", handlerStalled);

  console.info("scoringProcessQueue job is working!");
  scoringProcessQueue.process(scoringProcessJob);
  scoringProcessQueue.on("failed", handlerFailure);
  scoringProcessQueue.on("completed", handlerCompleted);
  scoringProcessQueue.on("stalled", handlerStalled);
  scoringProcessQueue.on("error", (err) => {
    console.log("scoringProcessQueue error : ", err);
  });

  console.info("scoringDailyProcessQueue job is working!");
  // scoringDailyProcessQueue.process(scoringDailyProcessJob);
  // scoringDailyProcessQueue.on("failed", handlerFailure);
  // scoringDailyProcessQueue.on("completed", handlerCompleted);
  // scoringDailyProcessQueue.on("stalled", handlerStalled);
  // scoringDailyProcessQueue.on("error", (err) => {
  //   console.log("scoringDailyProcessQueue error : ", err);
  // });

  /**
   * (START) General Queue
   */
  BetterSocialQueue.setEventCallback(credderScoreQueue, credderScoreProcess);
  // BetterSocialQueue.setEventCallback(testQueue, testProcess)

  BetterSocialQueue.setEventCallback(
    weeklyCredderUpdateQueue,
    credderWeeklyScoreProcess
  );
  BetterSocialQueue.setCron(weeklyCredderUpdateQueue, "0 12 * * *");

  BetterSocialQueue.setEventCallback(
    refreshUserFollowerCountMaterializedViewQueue,
    refreshUserFollowerCount
  );
  BetterSocialQueue.setCron(
    refreshUserFollowerCountMaterializedViewQueue,
    "0 * * * *"
  );

  BetterSocialQueue.setEventCallback(
    refreshUserTopicMaterializedViewQueue,
    refreshUserTopicFollower
  );
  BetterSocialQueue.setCron(refreshUserTopicMaterializedViewQueue, "1 * * * *");

  BetterSocialQueue.setEventCallback(
    refreshUserLocationMaterializedViewQueue,
    refreshUserLocationFollower
  );
  BetterSocialQueue.setCron(
    refreshUserLocationMaterializedViewQueue,
    "2 * * * *"
  );

  BetterSocialQueue.setEventCallback(
    refreshUserCommonFollowerMaterializedViewQueue,
    refreshUserCommonFollowerMaterializedViewProcess
  );
  BetterSocialQueue.setCron(
    refreshUserCommonFollowerMaterializedViewQueue,
    "3 * * * *"
  );

  BetterSocialQueue.setEventCallback(dailyRssUpdateQueue, rssProcess);
  BetterSocialQueue.setCron(dailyRssUpdateQueue, "48 13 * * *");

  /**
   * (END) General Queue
   */
};

initQueue();
