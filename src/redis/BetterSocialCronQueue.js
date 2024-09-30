// eslint-disable-next-line no-unused-vars
const Bull = require('bull');
const BetterSocialQueue = require('./BetterSocialQueue');
const {credderDailyScoreProcess} = require('../processes/credder-daily-score-process');
const {deleteExpiredPostProcess} = require('../processes/delete-expired-post-process');
const {rssProcess} = require('../processes/rss-process');
const {
  refreshAllMaterializedViewProcess
} = require('../processes/refresh-all-materialized-view-process');
const {scoringDailyProcessJob} = require('../processes/scoring-daily-process');
const {EVENT_DAILY_PROCESS_TRIGGER} = require('../processes/scoring-constant');

/**
 * @typedef {"dailyCredderUpdate" | "dailyDeleteExpiredPost" | "dailyRssUpdate" | "dailyScoring" | "topicAutoMessage" | "hourlyRefreshMaterializedView"} CronFlag
 */

/**
 * @typedef {Object} BetterSocialCronQueueObject
 * @property {CronFlag} flag
 */

/**
 * @typedef {Object} BetterSocialCronQueueInjection
 * @property {Bull.Queue} credderScoreQueue
 * @property {Bull.Queue} removeActivityQueue
 */

class BetterSocialCronQueue extends BetterSocialQueue {
  /**
   *
   * @param {Bull.Queue} queue
   * @param {string} cron
   * @param {CronFlag} flag
   * @param {Bull.Queue} queueInjection
   */
  static addCron(queue, cron, flag) {
    queue.add(
      {flag},
      {
        removeOnFail: true,
        removeOnComplete: true,
        repeat: {
          cron
        }
      }
    );
  }

  static setCronCallback(queue, process) {
    BetterSocialQueue.setEventCallback(queue, process);
  }

  /**
   *
   * @param {Bull.Job<BetterSocialCronQueueObject>} job
   * @param {Bull.DoneCallback} done
   * @param {BetterSocialCronQueueInjection} queueInjection
   */
  static process(job, done, queueInjection) {
    const {flag} = job.data;
    console.log(`============= DOING CRON JOB (${flag})  =============`);
    // if (flag === 'dailyCredderUpdate') {
    //   return credderDailyScoreProcess(job, done, queueInjection?.credderScoreQueue);
    // }

    if (flag === 'dailyDeleteExpiredPost') {
      return deleteExpiredPostProcess(job, done, queueInjection?.removeActivityQueue);
    }

    // if (flag === 'dailyRssUpdate') {
    //   return rssProcess(job, done);
    // }

    if (flag === 'dailyScoring') {
      job.data.event = EVENT_DAILY_PROCESS_TRIGGER;
      return scoringDailyProcessJob(job, done);
    }

    if (flag === 'hourlyRefreshMaterializedView') {
      return refreshAllMaterializedViewProcess(job, done);
    }

    if (flag === 'topicAutoMessage') {
      return topicAutoMessageProcess(job, done);
    }

    return done(null, 'No process found');
  }
}

module.exports = BetterSocialCronQueue;
