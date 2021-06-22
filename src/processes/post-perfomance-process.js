const {
  postScore, nonBpScoreWilsonScore, DurationScoreWilsonScore,
  upDownScoreWilsonScore, upDownScore
} = require("../utils")
require("dotenv").config();
const getValueFromDb = async () => {
  const { PostStatistic, StatisticPost } = require("../databases/models");
  const bp = await PostStatistic.sum('block_count');
  const upvote = await PostStatistic.sum('upvote_count');
  const downvote = await PostStatistic.sum('downvote_count');
  const impression = await StatisticPost.sum('counter');

  return { bp, impression, upvote ,downvote };
}

const postPerformanceScoreProcess = async () => {
  const { bp, impression, upvote, downvote } = await getValueFromDb();
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
  const duration = 10 //dummy data
  /*
    @description block point get from table post_blocked
  */
  const wsnonbp = nonBpScoreWilsonScore(bp, impression, Z_NON_BP, EV_NON_BP);
  /*
    @description
  */
  const wsd = DurationScoreWilsonScore(impression, duration, Z_D, EV_D_PERCENTAGE);
  /*
    @description upvote = Sum of Upvote-Points of a Post
    downvote = Sum of Downvote-Points of a Post
  */
  const sUpDown = upDownScore(impression, upvote, downvote, W_DOWN, W_N);
  const wsupdown = upDownScoreWilsonScore(impression, sUpDown, Z_UPDOWN, EV_UPDOWN_PERCENTAGE);
  const result = postScore(impression, wsnonbp, WW_NON_BP, wsd, WW_D, wsupdown, WW_UP_DOWN);

  console.info(`post performance score : ${result}`);
  return { post_performance_comments_score: result }
}

module.exports = {
  postPerformanceScoreProcess
}
