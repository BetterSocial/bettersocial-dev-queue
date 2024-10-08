const Sentry = require('@sentry/node');
const SentryProfiling = require('@sentry/profiling-node');
const {initializeApp, cert} = require('firebase-admin/app');
const {newsJob} = require('../processes/news-process');
const {scoringProcessJob} = require('../processes/scoring-process');
const {scoringDailyProcessJob} = require('../processes/scoring-daily-process');
const {unFollowFeedProcessJob} = require('../processes/unfollow-main-feed');
// const {updateMainFeedBroadProcessJob} = require('../processes/update-main-feed-broad');
const {syncUserFeedProcessJob} = require('../processes/sync-user-feed');
const processFollowMainFeedF2 = require('../processes/follow-main-feed-f2-process');
const {removeActivityProcessJob} = require('../processes/remove-activity-process');

const {handlerFailure, handlerCompleted, handlerStalled} = require('./handler');

const {
  newsQueue,
  scoringDailyProcessQueue,
  scoringProcessQueue,
  credderScoreQueue,
  deleteActivityProcessQueue,
  addUserPostCommentQueue,
  deleteUserPostCommentQueue,
  registerV2Queue,
  followTopicQueue,
  automateWelcomeMsgQueue,
  followMainFeedF2,
  unFollowMainFeedF2,
  unFollowFeedProcessQueue,
  // updateMainFeedBroadProcessQueue,
  syncUserFeedQueue,
  generalDailyQueue,
  removeActivityQueue
} = require('../config');

const {registerProcess: registerV2Process} = require('../processes/registerv2-process');
const {followTopicProcess} = require('../processes/follow-topic-process');
const {
  automateWelcomeMsgProcess: autoWelcomeMsgProcess
} = require('../processes/auto-welcome-msg-process');
const {credderScoreProcess} = require('../processes/credder-score-process');

const BetterSocialQueue = require('../redis/BetterSocialQueue');
const {addUserPostCommentProcess} = require('../processes/add-user-post-comment');
const {deleteUserPostCommentProcess} = require('../processes/delete-user-post-comment-process');
const BetterSocialCronQueue = require('../redis/BetterSocialCronQueue');

const serviceAccount = Buffer.from(process.env.SERVICE_ACCOUNT, 'base64').toString();
initializeApp({credential: cert(JSON.parse(serviceAccount))});

/*
  @description initial all job queue
*/
const initQueue = () => {
  // Setup sentry
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    integrations: [
      // enable HTTP calls tracing
      new Sentry.Integrations.Http({
        tracing: true
      }),
      new SentryProfiling.ProfilingIntegration()
    ],
    environment: process.env.NODE_ENV,
    // Performance Monitoring
    tracesSampleRate: 0.1, // Capture 100% of the transactions, reduce in production!,
    profilesSampleRate: 0.1
  });

  console.info('newsQueue job is working!');
  newsQueue.process(newsJob);
  newsQueue.on('failed', handlerFailure);
  newsQueue.on('completed', handlerCompleted);
  newsQueue.on('stalled', handlerStalled);
  newsQueue.on('error', (err) => {
    console.error('newsQueue error : ', err);
  });
  newsQueue.on('active', () => {});

  console.log('Register Queue V2 job is working');
  registerV2Queue.process(registerV2Process);
  registerV2Queue.on('failed', handlerFailure);
  registerV2Queue.on('completed', handlerCompleted);
  registerV2Queue.on('stalled', handlerStalled);

  console.log('Follow topic job is working');
  followTopicQueue.process(followTopicProcess);
  followTopicQueue.on('failed', handlerFailure);
  followTopicQueue.on('completed', handlerCompleted);
  followTopicQueue.on('stalled', handlerStalled);

  console.log('Automate Welcome Msg is working');
  automateWelcomeMsgQueue.process(autoWelcomeMsgProcess);
  automateWelcomeMsgQueue.on('failed', handlerFailure);
  automateWelcomeMsgQueue.on('completed', handlerCompleted);
  automateWelcomeMsgQueue.on('stalled', handlerStalled);

  console.info('scoringProcessQueue job is working!');
  scoringProcessQueue.process(scoringProcessJob);
  scoringProcessQueue.on('failed', handlerFailure);
  scoringProcessQueue.on('completed', handlerCompleted);
  scoringProcessQueue.on('stalled', handlerStalled);
  scoringProcessQueue.on('error', (err) => {
    console.error('scoringProcessQueue error : ', err);
  });

  console.info('scoringDailyProcessQueue job is working!');
  scoringDailyProcessQueue.process(scoringDailyProcessJob);
  scoringDailyProcessQueue.on('failed', handlerFailure);
  scoringDailyProcessQueue.on('completed', handlerCompleted);
  scoringDailyProcessQueue.on('stalled', handlerStalled);
  scoringDailyProcessQueue.on('error', (err) => {
    console.log('scoringDailyProcessQueue error : ', err);
  });

  console.info('deleteActivityProcessQueue job is working!');
  deleteActivityProcessQueue.process(removeActivityProcessJob);
  deleteActivityProcessQueue.on('failed', handlerFailure);
  deleteActivityProcessQueue.on('completed', handlerCompleted);
  deleteActivityProcessQueue.on('stalled', handlerStalled);
  deleteActivityProcessQueue.on('error', (err) => {
    console.error('deleteActivityProcessQueue error : ', err);
  });

  console.info('unFollowFeedProcessQueue job is working!');
  unFollowFeedProcessQueue.process(unFollowFeedProcessJob);
  unFollowFeedProcessQueue.on('failed', handlerFailure);
  unFollowFeedProcessQueue.on('completed', handlerCompleted);
  unFollowFeedProcessQueue.on('stalled', handlerStalled);
  unFollowFeedProcessQueue.on('error', (err) => {
    console.error('unFollowFeedProcessQueue error : ', err);
  });

  // Disable updateMainFeedBroadProcessQueue

  // console.info('updateMainFeedBroadProcessQueue job is working!');
  // updateMainFeedBroadProcessQueue.process(updateMainFeedBroadProcessJob);
  // updateMainFeedBroadProcessQueue.on('failed', handlerFailure);
  // updateMainFeedBroadProcessQueue.on('completed', handlerCompleted);
  // updateMainFeedBroadProcessQueue.on('stalled', handlerStalled);
  // updateMainFeedBroadProcessQueue.on('error', (err) => {
  //   console.error('updateMainFeedBroadProcessQueue error : ', err);
  // });

  console.info('syncUserFeedQueue job is working!');
  syncUserFeedQueue.process(syncUserFeedProcessJob);
  syncUserFeedQueue.on('failed', handlerFailure);
  syncUserFeedQueue.on('completed', handlerCompleted);
  syncUserFeedQueue.on('stalled', handlerStalled);
  syncUserFeedQueue.on('error', (err) => {
    console.error('syncUserFeedQueue error : ', err);
  });

  console.info('followMainFeedF2Queue job is working!');
  followMainFeedF2.process(processFollowMainFeedF2.processFollow);
  followMainFeedF2.on('failed', handlerFailure);
  followMainFeedF2.on('completed', handlerCompleted);
  followMainFeedF2.on('stalled', handlerStalled);
  followMainFeedF2.on('error', (err) => {
    console.error('followMainFeedF2Queue error : ', err);
  });

  console.info('removeActivityQueue job is working!');
  removeActivityQueue.process(removeActivityProcessJob);
  removeActivityQueue.on('failed', handlerFailure);
  removeActivityQueue.on('completed', handlerCompleted);
  removeActivityQueue.on('stalled', handlerStalled);
  removeActivityQueue.on('error', (err) => {
    console.error('removeActivity error : ', err);
  });

  unFollowMainFeedF2.process(processFollowMainFeedF2.processUnfollow);

  /**
   * (START) General Queue
   */
  // BetterSocialQueue.setEventCallback(credderScoreQueue, credderScoreProcess);

  BetterSocialQueue.setEventCallback(addUserPostCommentQueue, addUserPostCommentProcess);
  BetterSocialQueue.setEventCallback(deleteUserPostCommentQueue, deleteUserPostCommentProcess);

  BetterSocialCronQueue.setCronCallback(generalDailyQueue, (job, done) =>
    BetterSocialCronQueue.process(job, done, {
      credderScoreQueue,
      removeActivityQueue
    })
  );
  // BetterSocialCronQueue.addCron(generalDailyQueue, '0 0,12,18 * * *', 'dailyRssUpdate');
  // BetterSocialCronQueue.addCron(generalDailyQueue, '0 12 * * *', 'dailyCredderUpdate');
  BetterSocialCronQueue.addCron(generalDailyQueue, '0 0 * * *', 'dailyDeleteExpiredPost');
  BetterSocialCronQueue.addCron(generalDailyQueue, '30 11 */2 * *', 'dailyScoring');
  BetterSocialCronQueue.addCron(generalDailyQueue, '0 * * * *', 'refreshMaterializedView');
  BetterSocialCronQueue.addCron(generalDailyQueue, '0 8 * * *', 'topicAutoMessage');
  /**
   * (END) General Queue
   */
};

initQueue();
