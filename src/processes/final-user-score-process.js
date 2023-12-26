require('dotenv').config();
const {StatisticPost, PostStatistic} = require('../databases/models');
const {
  finalScorePost,
  previousInteractionScore,
  applyMultipliesToTotalScore,
  scoreBasedPostCharacteristics,
  RecencyScore,
  ageOfPost,
  postPerformanceScore,
  weightPostLongComments
} = require('../utils');

const validatePostMessage = (str) => {
  const urlRegex = /(https?:\/\/[^ ]*)/;
  const urlValidation = str.match(urlRegex);

  if (urlValidation) {
    return true;
  }
  return false;
};

const finalUserScoreProcess = async (u, p, pPerf, job) => {
  const impression = await StatisticPost.sum('counter');
  const comment = await PostStatistic.sum('comment_count');
  const topicLength = job.topics.length; // ambil dari getstream post jumlah topics
  const durationFeed = job.duration_feed; // ambil dari getstream duration_feed
  const now = new Date().toISOString();
  const WLONGC = process.env.W_LONGC || 1;
  const PREVD = process.env.PREV_D || 0.05;
  const PREVUC = process.env.PREV_UC || 0.8;
  const PREVPRE = process.env.PREV_PRE || 0.5;
  const D = process.env.D || 1;
  const agePost = ageOfPost(durationFeed, now, now);
  const rec = RecencyScore(agePost, durationFeed);
  const postLink = validatePostMessage(job.body);
  // need to confirm for variabel prevInteract default set seen userFollowAuthor, followAuthorFollower, linkPost and att
  const prev = previousInteractionScore('seen', PREVD, PREVUC, PREVPRE);
  const p1 = applyMultipliesToTotalScore(topicLength, 1, '', 1);
  const att = '';
  const p2 = scoreBasedPostCharacteristics(rec, att, D, p, postLink);
  const pLongC = weightPostLongComments(comment, impression, WLONGC);
  const p3 = postPerformanceScore(pPerf, pLongC);
  const final_score = finalScorePost(u, p1, p2, p3, prev);
  console.info(`final score post of user : ${final_score}`);

  return {final_score};
};

module.exports = {
  finalUserScoreProcess
};
