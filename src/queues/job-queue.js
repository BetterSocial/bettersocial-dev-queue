const { newsJob } = require("../processes/news-process");
const { createPostTime } = require("../processes/post-time-process");
const { scoringProcessJob } = require("../processes/scoring-process");
const { scoringDailyProcessJob } = require("../processes/scoring-daily-process");
const { deleteActivityProcessJob } = require("../processes/delete-activity-process");
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
  dailyCredderUpdateQueue,
  dailyRssUpdateQueue,
  refreshUserFollowerCountMaterializedViewQueue,
  refreshUserTopicMaterializedViewQueue,
  refreshUserLocationMaterializedViewQueue,
  dailyRssUpdateQueueSecond,
  refreshUserCommonFollowerMaterializedViewQueue,
  deleteActivityProcessQueue,
  deleteExpiredPost,
  addUserPostComment,
  addUserPostCommentQueue,
  deleteUserPostCommentQueue,
  registerV2Queue
} = require("../config");

const {
  addUserToChannel,
  addUserToTopicChannel,
} = require("../processes/chat-process");
const { prepopulatedDm } = require("../processes/prepopulate-dm-process");
const { registerProcess } = require("../processes/register-process");
const { registerProcess: registerV2Process } = require("../processes/registerv2-process");
const { testProcess } = require("../processes/test-process");
const { updateDomainCredderScore } = require("../utils");
const { credderScoreProcess } = require("../processes/credder-score-process");

const { rssProcess } = require("../processes/rss-process");
const { refreshUserFollowerCount } = require("../processes/refresh-user-follower-count-process");
const { refreshUserTopicFollower, } = require("../processes/refresh-user-topic-process");
const { refreshUserLocationFollower, } = require("../processes/refresh-user-location-process");
const BetterSocialQueue = require("../redis/BetterSocialQueue");
const { refreshUserCommonFollowerMaterializedViewProcess } = require("../processes/refresh-user-common-follower-count-process");
const { deleteExpiredPostProcess } = require("../processes/delete-expired-post-process");
const { credderDailyScoreProcess } = require("../processes/credder-daily-score-process");
const { addUserPostCommentProcess } = require("../processes/add-user-post-comment");
const { deleteUserPostCommentProcessQueue, deleteUserPostCommentProcess } = require("../processes/delete-user-post-comment-process");

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
    console.error("newsQueue error : ", err);
  });
  newsQueue.on("active", (res) => {
    // console.log(res);
  });

  console.log("Register Queue job is working");
  registerQueue.process(registerProcess);
  registerQueue.on("failed", handlerFailure);
  registerQueue.on("completed", handlerCompleted);
  registerQueue.on("stalled", handlerStalled);

  console.log("Register Queue V2 job is working");
  registerV2Queue.process(registerV2Process);
  registerV2Queue.on("failed", handlerFailure);
  registerV2Queue.on("completed", handlerCompleted);
  registerV2Queue.on("stalled", handlerStalled);

  console.info("scoringProcessQueue job is working!");
  scoringProcessQueue.process(scoringProcessJob);
  scoringProcessQueue.on("failed", handlerFailure);
  scoringProcessQueue.on("completed", handlerCompleted);
  scoringProcessQueue.on("stalled", handlerStalled);
  scoringProcessQueue.on("error", (err) => {
    console.error("scoringProcessQueue error : ", err);
  });

  console.info("scoringDailyProcessQueue job is working!");
  // scoringDailyProcessQueue.process(scoringDailyProcessJob);
  // scoringDailyProcessQueue.on("failed", handlerFailure);
  // scoringDailyProcessQueue.on("completed", handlerCompleted);
  // scoringDailyProcessQueue.on("stalled", handlerStalled);
  // scoringDailyProcessQueue.on("error", (err) => {
  //   console.log("scoringDailyProcessQueue error : ", err);
  // });
  console.info("deleteActivityProcessQueue job is working!");
  deleteActivityProcessQueue.process(deleteActivityProcessJob);
  deleteActivityProcessQueue.on("failed", handlerFailure);
  deleteActivityProcessQueue.on("completed", handlerCompleted);
  deleteActivityProcessQueue.on("stalled", handlerStalled);
  deleteActivityProcessQueue.on("error", (err) => {
    console.error("deleteActivityProcessQueue error : ", err);
  });

  /**
   * (START) General Queue
   */
  BetterSocialQueue.setEventCallback(credderScoreQueue, credderScoreProcess)
  // BetterSocialQueue.setEventCallback(dailyCredderUpdateQueue, credderDailyScoreProcess);
  // BetterSocialQueue.setCron(dailyCredderUpdateQueue, "0 12 * * *");

  BetterSocialQueue.setEventCallback(addUserPostCommentQueue, addUserPostCommentProcess)
  BetterSocialQueue.setEventCallback(deleteUserPostCommentQueue, deleteUserPostCommentProcess)

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

  BetterSocialQueue.setEventCallback(dailyRssUpdateQueue, rssProcess)
  BetterSocialQueue.setCron(dailyRssUpdateQueue, "0 0,12,18 * * *")

  BetterSocialQueue.setEventCallback(deleteExpiredPost, deleteExpiredPostProcess)
  BetterSocialQueue.setCron(deleteExpiredPost, "0 0 * * *")
  /**
   * (END) General Queue
   */
};

initQueue();
