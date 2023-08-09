const { newsJob } = require("../processes/news-process");
const { createPostTime } = require("../processes/post-time-process");
const { scoringProcessJob } = require("../processes/scoring-process");
const { scoringDailyProcessJob } = require("../processes/scoring-daily-process");
const { deleteActivityProcessJob } = require("../processes/delete-activity-process");
const { unFollowFeedProcessJob } = require("../processes/unfollow-main-feed");
const { updateMainFeedBroadProcessJob } = require("../processes/update-main-feed-broad");
const { syncUserFeedProcessJob } = require("../processes/sync-user-feed");
const processFollowMainFeedF2 = require("../processes/follow-main-feed-f2-process");


const {
  handlerFailure,
  handlerCompleted,
  handlerStalled,
} = require("./handler");

const {
  newsQueue,
  postTimeQueue,
  scoringDailyProcessQueue,
  scoringProcessQueue,
  testQueue,
  credderScoreQueue,
  dailyCredderUpdateQueue,
  dailyRssUpdateQueue,
  deleteActivityProcessQueue,
  deleteExpiredPost,
  addUserPostCommentQueue,
  deleteUserPostCommentQueue,
  registerV2Queue,
  refreshMaterializedViewQueue,
  followMainFeedF2,
  unFollowMainFeedF2,
  unFollowFeedProcessQueue,
  updateMainFeedBroadProcessQueue,
  syncUserFeedQueue
} = require("../config");

const { registerProcess: registerV2Process } = require("../processes/registerv2-process");
const { credderScoreProcess } = require("../processes/credder-score-process");

const { rssProcess } = require("../processes/rss-process");
const BetterSocialQueue = require("../redis/BetterSocialQueue");
const { deleteExpiredPostProcess } = require("../processes/delete-expired-post-process");
const { credderDailyScoreProcess } = require("../processes/credder-daily-score-process");
const { addUserPostCommentProcess } = require("../processes/add-user-post-comment");
const { deleteUserPostCommentProcessQueue, deleteUserPostCommentProcess } = require("../processes/delete-user-post-comment-process");
const { refreshAllMaterializedViewProcess } = require("../processes/refresh-all-materialized-view-process");

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
  newsQueue.on("active", (res) => {});

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
  scoringDailyProcessQueue.process(scoringDailyProcessJob);
  scoringDailyProcessQueue.on("failed", handlerFailure);
  scoringDailyProcessQueue.on("completed", handlerCompleted);
  scoringDailyProcessQueue.on("stalled", handlerStalled);
  scoringDailyProcessQueue.on("error", (err) => {
    console.log("scoringDailyProcessQueue error : ", err);
  });

  console.info("deleteActivityProcessQueue job is working!");
  deleteActivityProcessQueue.process(deleteActivityProcessJob);
  deleteActivityProcessQueue.on("failed", handlerFailure);
  deleteActivityProcessQueue.on("completed", handlerCompleted);
  deleteActivityProcessQueue.on("stalled", handlerStalled);
  deleteActivityProcessQueue.on("error", (err) => {
    console.error("deleteActivityProcessQueue error : ", err);
  });

  console.info("unFollowFeedProcessQueue job is working!");
  unFollowFeedProcessQueue.process(unFollowFeedProcessJob);
  unFollowFeedProcessQueue.on("failed", handlerFailure);
  unFollowFeedProcessQueue.on("completed", handlerCompleted);
  unFollowFeedProcessQueue.on("stalled", handlerStalled);
  unFollowFeedProcessQueue.on("error", (err) => {
    console.error("unFollowFeedProcessQueue error : ", err);
  });

  console.info("updateMainFeedBroadProcessQueue job is working!");
  updateMainFeedBroadProcessQueue.process(updateMainFeedBroadProcessJob);
  updateMainFeedBroadProcessQueue.on("failed", handlerFailure);
  updateMainFeedBroadProcessQueue.on("completed", handlerCompleted);
  updateMainFeedBroadProcessQueue.on("stalled", handlerStalled);
  updateMainFeedBroadProcessQueue.on("error", (err) => {
    console.error("updateMainFeedBroadProcessQueue error : ", err);
  });

  console.info("syncUserFeedQueue job is working!");
  syncUserFeedQueue.process(syncUserFeedProcessJob);
  syncUserFeedQueue.on("failed", handlerFailure);
  syncUserFeedQueue.on("completed", handlerCompleted);
  syncUserFeedQueue.on("stalled", handlerStalled);
  syncUserFeedQueue.on("error", (err) => {
    console.error("syncUserFeedQueue error : ", err);
  });

  followMainFeedF2.process(processFollowMainFeedF2.processFollow);
  unFollowMainFeedF2.process(processFollowMainFeedF2.processUnfollow);

  /**
   * (START) General Queue
   */
  BetterSocialQueue.setEventCallback(credderScoreQueue, credderScoreProcess)
  BetterSocialQueue.setEventCallback(dailyCredderUpdateQueue, credderDailyScoreProcess);
  BetterSocialQueue.setCron(dailyCredderUpdateQueue, "0 12 * * *");

  BetterSocialQueue.setEventCallback(addUserPostCommentQueue, addUserPostCommentProcess)
  BetterSocialQueue.setEventCallback(deleteUserPostCommentQueue, deleteUserPostCommentProcess)

  BetterSocialQueue.setEventCallback(
    refreshMaterializedViewQueue,
    refreshAllMaterializedViewProcess
  );
  BetterSocialQueue.setCron(
    refreshMaterializedViewQueue,
    "0 * * * *"
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
