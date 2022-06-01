const { newsJob } = require("../processes/news-process");
const { createPostTime } = require("../processes/post-time-process");
const { scoringProcessJob } = require("../processes/scoring-process");
const { scoringDailyProcessJob } = require("../processes/scoring-daily-process");
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
const { credderWeeklyScoreProcess } = require("../processes/credder-weekly-score-process");
const { rssProcess } = require("../processes/rss-process");
const { refreshUserFollowerCount } = require("../processes/refresh-user-follower-count-process");
const { refreshUserTopicFollower } = require("../processes/refresh-user-topic-process");
const { refreshUserLocationFollower } = require("../processes/refresh-user-location-process");

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
    })

    // Cit, 20220329, postTimeQueue is not needed anymore, already covered in scoring
    // console.info("postTimeQueue job is working!");
    // postTimeQueue.process(createPostTime);
    // postTimeQueue.on("failed", handlerFailure);
    // postTimeQueue.on("completed", handlerCompleted);
    // postTimeQueue.on("stalled", handlerStalled);
    // postTimeQueue.on("error", (err) => {
    //   console.log("posttime error: ", err);
    // })

    // console.info("Follow location job is working!");
    // locationQueue.process(followLocation);
    // locationQueue.on("failed", handlerFailure);
    // locationQueue.on("completed", handlerCompleted);
    // locationQueue.on("stalled", handlerStalled);

    // console.log("Follow user job is working!");
    // followUserQueue.process(followUser);
    // followUserQueue.on("failed", handlerFailure);
    // followUserQueue.on("completed", handlerCompleted);
    // followUserQueue.on("stalled", handlerStalled);
    // followUserQueue.on('error', (err) => {
    //   console.error('error follow user', err);
    // })

    // console.log("Follow topic job is working!");
    // followTopicQueue.process(followTopic);
    // followTopicQueue.on("failed", handlerFailure);
    // followTopicQueue.on("completed", handlerCompleted);
    // followTopicQueue.on("stalled", handlerStalled);

    // console.log("Add new User to channel job is working");
    // addUserToChannelQueue.process(addUserToChannel);
    // addUserToChannelQueue.on("failed", handlerFailure);
    // addUserToChannelQueue.on("completed", handlerCompleted);
    // addUserToChannelQueue.on("stalled", handlerStalled);

    // console.log("Add new user To topic channel job is working");
    // addUserToTopicChannelQueue.process(addUserToTopicChannel);
    // addUserToTopicChannelQueue.on("failed", handlerFailure);
    // addUserToTopicChannelQueue.on("completed", handlerCompleted);
    // addUserToTopicChannelQueue.on("stalled", handlerStalled);

    // console.log("Prepopulated dm job is working");
    // prepopulatedDmQueue.process(prepopulatedDm);
    // prepopulatedDmQueue.on("failed", handlerFailure);
    // prepopulatedDmQueue.on("completed", handlerCompleted);
    // prepopulatedDmQueue.on("stalled", handlerStalled);
    /*  console.log('Test Queue job is working');
      testQueue.process(testProcess);
      testQueue.on("failed", handlerFailure);
      testQueue.on("completed", handlerCompleted);
      testQueue.on("stalled", handlerStalled);*/

    console.log('Credder Score Queue job is working');
    credderScoreQueue.process(credderScoreProcess);
    credderScoreQueue.on("failed", handlerFailure);
    credderScoreQueue.on("completed", handlerCompleted);
    credderScoreQueue.on("stalled", handlerStalled);

    console.log('Register Queue job is working');
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
    scoringDailyProcessQueue.process(scoringDailyProcessJob);
    scoringDailyProcessQueue.on("failed", handlerFailure);
    scoringDailyProcessQueue.on("completed", handlerCompleted);
    scoringDailyProcessQueue.on("stalled", handlerStalled);
    scoringDailyProcessQueue.on("error", (err) => {
        console.log("scoringDailyProcessQueue error : ", err);
    });

    // console.log('Credder Weekly Score Queue job is working');
    // weeklyCredderUpdateQueue.process(credderWeeklyScoreProcess);
    // weeklyCredderUpdateQueue.on("failed", handlerFailure);
    // weeklyCredderUpdateQueue.on("completed", handlerCompleted);
    // weeklyCredderUpdateQueue.on("stalled", handlerStalled);

    // weeklyCredderUpdateQueue.add({}, {
    //     repeat: {
    //         cron: "0 12 * * *"
    //     }
    // });

    // console.log('Hourly refresh user follower count materialized view job is working');
    // refreshUserFollowerCountMaterializedViewQueue.process(refreshUserFollowerCount);
    // refreshUserFollowerCountMaterializedViewQueue.on("failed", handlerFailure);
    // refreshUserFollowerCountMaterializedViewQueue.on("completed", handlerCompleted);
    // refreshUserFollowerCountMaterializedViewQueue.on("stalled", handlerStalled);
    // refreshUserFollowerCountMaterializedViewQueue.add({}, {
    //     repeat: {
    //         cron: "0 * * * *"
    //     }
    // });

    // console.log('Hourly refresh user topic materialized view job is working');
    // refreshUserTopicMaterializedViewQueue.process(refreshUserTopicFollower);
    // refreshUserTopicMaterializedViewQueue.on("failed", handlerFailure);
    // refreshUserTopicMaterializedViewQueue.on("completed", handlerCompleted);
    // refreshUserTopicMaterializedViewQueue.on("stalled", handlerStalled);
    // refreshUserTopicMaterializedViewQueue.add({}, {
    //     repeat: {
    //         cron: "5 * * * *"
    //     }
    // });

    // console.log('Hourly refresh user follower count materialized view job is working');
    // refreshUserLocationMaterializedViewQueue.process(refreshUserLocationFollower);
    // refreshUserLocationMaterializedViewQueue.on("failed", handlerFailure);
    // refreshUserLocationMaterializedViewQueue.on("completed", handlerCompleted);
    // refreshUserLocationMaterializedViewQueue.on("stalled", handlerStalled);
    // refreshUserLocationMaterializedViewQueue.add({}, {
    //     repeat: {
    //         cron: "10 * * * *"
    //     }
    // });


    console.log('Daily Rss update Queue job is working');
    dailyRssUpdateQueue.process(rssProcess);
    dailyRssUpdateQueue.on("failed", handlerFailure);
    dailyRssUpdateQueue.on("completed", handlerCompleted);
    dailyRssUpdateQueue.on("stalled", handlerStalled);

    dailyRssUpdateQueue.add({}, {
        repeat: {
            cron: "0 0,12 * * *"
        }
    });

    // console.log('Daily Rss Second update Queue job is working');
    // dailyRssUpdateQueueSecond.process(rssProcess);
    // dailyRssUpdateQueueSecond.on("failed", handlerFailure);
    // dailyRssUpdateQueueSecond.on("completed", handlerCompleted);
    // dailyRssUpdateQueueSecond.on("stalled", handlerStalled);

    // dailyRssUpdateQueueSecond.add({}, {
    //     repeat: {
    //         cron: "0 18 * * *"
    //     }
    // });

};

initQueue();
