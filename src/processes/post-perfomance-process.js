// Probably this file will be deleted because its not used anymore
const {
  postScore,
  nonBpScoreWilsonScore,
  durationScoreWilsonScore,
  upDownScoreWilsonScore,
  upDownScore,
  dBench
} = require('../utils');
require('dotenv').config();

const getValueFromDb = async (post_id, user_id) => {
  const {
    PostStatistic,
    StatisticPost,
    UserBlockedUser,
    VwPostTime
  } = require('../databases/models');
  const bp = await UserBlockedUser.count({where: {user_id_blocked: user_id}});
  const upvote = await PostStatistic.sum('upvote_count');
  const downvote = await PostStatistic.sum('downvote_count');
  const impression = await StatisticPost.sum('counter');
  const postImpression = await VwPostTime.findOne({
    where: {post_id},
    attributes: ['post_id', 'average']
  });
  let postImprValue;
  if (postImpression) {
    postImprValue = postImpression.dataValues.average;
  } else {
    postImprValue = 0;
  }

  return {bp, impression, upvote, downvote, postImprValue};
};

const validatePostMessage = (str) => {
  const urlRegex = /(https?:\/\/[^ ]*)/;
  const urlValidation = str.match(urlRegex);

  if (urlValidation) {
    return 0;
  }
  return str.length;
};

const postPerformanceScoreProcess = async (job) => {
  try {
    const {bp, impression, upvote, downvote, postImprValue} = await getValueFromDb(
      job.id_feed,
      job.user_id
    );
    const WW_NON_BP = process.env.WW_NONBP;
    const {WW_D} = process.env;
    const WW_UP_DOWN = process.env.WW_UPDOWN;
    const Z_NON_BP = process.env.Z_NONBP;
    const EV_NON_BP = process.env.EV_NONBP_PERCENTAGE;
    const {Z_D} = process.env;
    const {EV_D_PERCENTAGE} = process.env;
    const {Z_UPDOWN} = process.env;
    const {EV_UPDOWN_PERCENTAGE} = process.env;
    const {W_DOWN} = process.env;
    const {W_N} = process.env;
    const {DUR_MIN} = process.env;
    const {DUR_MARG} = process.env;
    const D_BENCH = dBench(DUR_MIN, DUR_MARG, validatePostMessage(job.body));
    let duration;
    if (postImprValue > D_BENCH) {
      duration = 1;
    } else {
      duration = 0;
    }
    /*
      @description block point get from table post_blocked
    */
    const wsnonbp = nonBpScoreWilsonScore(bp, impression);
    /*
      @description
    */
    const wsd = durationScoreWilsonScore(impression, duration);
    /*
      @description upvote = Sum of Upvote-Points of a Post
      downvote = Sum of Downvote-Points of a Post
    */
    const sUpDown = upDownScore(impression, upvote, downvote);
    const wsupdown = upDownScoreWilsonScore(impression, sUpDown);
    const result = postScore(impression, wsnonbp, wsd, wsupdown);

    console.info(`post performance score : ${result}`);
    return {post_performance_comments_score: result};
  } catch (error) {
    console.info(error);
  }
};

module.exports = {
  postPerformanceScoreProcess
};
