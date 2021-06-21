const {
  postScore, nonBpScoreWilsonScore, DurationScoreWilsonScore,
  upDownScoreWilsonScore, upDownScore
} = require("../utils")

require('dotenv').config()

const postPerformanceScoreProcess = () => {
  const WW_NON_BP = process.env.WW_NON_BP;
  const WW_D = process.env.WW_D;
  const WW_UP_DOWN = process.env.WW_UP_DOWN;
  const Z_NON_BP = process.env.Z_NONBP;
  const EV_NON_BP = process.env.EV_NONBP_PERCENTAGE;
  const Z_D = process.env.Z_D;
  const EV_D_PERCENTAGE = process.env.EV_D_PERCENTAGE;
  const Z_UPDOWN = process.env.Z_UPDOWN;
  const EV_UPDOWN_PERCENTAGE = process.env.EV_UPDOWN_PERCENTAGE;
  const W_DOWN = process.env.W_DOWN;
  const W_N = process.env.W_N;
  const bp = 2 // dummy data
  const impression = 10 // dummy data
  const duration = 10 //dummy data
  const upvote = 11;
  const downvote = 11;
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

  console.info(result);
}

postPerformanceScoreProcess();
