// eslint-disable-next-line no-unused-vars
const Bull = require('bull');
const BetterSocialQueue = require('./BetterSocialQueue');
const {credderDailyScoreProcess} = require('../processes/credder-daily-score-process');
const {deleteExpiredPostProcess} = require('../processes/delete-expired-post-process');
const {rssProcess} = require('../processes/rss-process');
const {
  refreshAllMaterializedViewProcess
} = require('../processes/refresh-all-materialized-view-process');

/**
 * @typedef {"dailyCredderUpdate" | "dailyDeleteExpiredPost" | "dailyRssUpdate" | "hourlyRefreshMaterializedView"} CronFlag
 */

/**
 * @typedef {Object} BetterSocialCronQueueObject
 * @property {CronFlag} flag
 */

class BetterSocialCronQueue extends BetterSocialQueue {
  /**
   *
   * @param {Bull.Queue} queue
   * @param {string} cron
   * @param {CronFlag} flag
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
   */
  static process(job, done) {
    const {flag} = job.data;
    console.log(`============= DOING CRON JOB (${flag})  =============`);
    if (flag === 'dailyCredderUpdate') {
      return credderDailyScoreProcess(job, done);
    }

    if (flag === 'dailyDeleteExpiredPost') {
      return deleteExpiredPostProcess(job, done);
    }

    if (flag === 'dailyRssUpdate') {
      return rssProcess(job, done);
    }

    if (flag === 'hourlyRefreshMaterializedView') {
      return refreshAllMaterializedViewProcess(job, done);
    }

    return done(null, 'No process found');
  }
}

module.exports = BetterSocialCronQueue;
