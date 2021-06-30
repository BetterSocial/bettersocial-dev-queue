const {
  postScore, nonBpScoreWilsonScore, durationScoreWilsonScore,
  upDownScoreWilsonScore, upDownScore, dBench
} = require("../utils");
require("dotenv").config();

const getValueFromDb = async (post_id, user_id) => {
  const { PostStatistic, StatisticPost, UserBlockedUser, VwPostTime } = require("../databases/models");
  const bp = await UserBlockedUser.count({ where: { user_id_blocked: user_id }});
  const upvote = await PostStatistic.sum('upvote_count');
  const downvote = await PostStatistic.sum('downvote_count');
  const impression = await StatisticPost.sum('counter');
  const postImpression = await VwPostTime.findOne({ where: { post_id }, attributes: ['post_id', 'average'] });
  let postImprValue;
  if (postImpression) {
    postImprValue = postImpression.dataValues.average;
  }else {
    postImprValue = 0;
  }

  return { bp, impression, upvote, downvote, postImprValue };
}

const validatePostMessage = (str) => {
  const urlRegex = /(https?:\/\/[^ ]*)/;
  const urlValidation = str.match(urlRegex);

  if (urlValidation) {
    return 0
  } else {
    return str.length
  }
}

const postPerformanceScoreProcess = async (job) => {
  try {
    const {
      bp, impression, upvote, downvote, postImprValue
    } = await getValueFromDb(job.id_feed, job.user_id);
    const WW_NON_BP = process.env.WW_NONBP;
    const WW_D = process.env.WW_D;
    const WW_UP_DOWN = process.env.WW_UPDOWN;
    const Z_NON_BP = process.env.Z_NONBP;
    const EV_NON_BP = process.env.EV_NONBP_PERCENTAGE;
    const Z_D = process.env.Z_D;
    const EV_D_PERCENTAGE = process.env.EV_D_PERCENTAGE;
    const Z_UPDOWN = process.env.Z_UPDOWN;
    const EV_UPDOWN_PERCENTAGE = process.env.EV_UPDOWN_PERCENTAGE;
    const W_DOWN = process.env.W_DOWN;
    const W_N = process.env.W_N;
    const DUR_MIN = process.env.DUR_MIN;
    const DUR_MARG = process.env.DUR_MARG;
    const D_BENCH = dBench(DUR_MIN, DUR_MARG, validatePostMessage(job.body))
    let duration;
    if(postImprValue > D_BENCH) {
      duration = 1
    } else {
      duration = 0
    }
    /*
      @description block point get from table post_blocked
    */
    const wsnonbp = nonBpScoreWilsonScore(bp, impression, Z_NON_BP, EV_NON_BP);
    /*
      @description
    */
    const wsd = durationScoreWilsonScore(impression, duration, Z_D, EV_D_PERCENTAGE);
    /*
      @description upvote = Sum of Upvote-Points of a Post
      downvote = Sum of Downvote-Points of a Post
    */
    const sUpDown = upDownScore(impression, upvote, downvote, W_DOWN, W_N);
    const wsupdown = upDownScoreWilsonScore(impression, sUpDown, Z_UPDOWN, EV_UPDOWN_PERCENTAGE);
    const result = postScore(impression, wsnonbp, WW_NON_BP, wsd, WW_D, wsupdown, WW_UP_DOWN);

    console.info(`post performance score : ${result}`);
    return { post_performance_comments_score: result }
  } catch (error) {
    console.info(error);
  }
}

module.exports = {
  postPerformanceScoreProcess
}
