require("dotenv").config();
const {
  scoreBasedPostCharacteristics,
  RecencyScore,
  ageOfPost,
  postPerformanceScore,
  weightPostLongComments,
  postCountScore,
  finalScorePost,
  postScore,
  nonBpScoreWilsonScore,
  durationScoreWilsonScore,
  upDownScoreWilsonScore,
  upDownScore,
} = require("../../utils");

const calcPostPerformanceScore = (postScoreDoc) => {
  const Z_NON_BP = process.env.Z_NONBP;
  const EV_NON_BP = process.env.EV_NONBP_PERCENTAGE;
  const WW_NON_BP = process.env.WW_NONBP;
  const { WW_D } = process.env.WW_D;
  const WW_UP_DOWN = process.env.WW_UPDOWN;
  const { Z_D } = process.env;
  const { EV_D_PERCENTAGE } = process.env;
  const { Z_UPDOWN } = process.env;
  const { EV_UPDOWN_PERCENTAGE } = process.env;
  const { W_DOWN } = process.env;
  const { W_N } = process.env;
  const impression = postScoreDoc.impr_score;

  /*
      @description block point get from table post_blocked
    */
  const wsnonbp = nonBpScoreWilsonScore(
    postScoreDoc.BP_score,
    impression,
    Z_NON_BP,
    EV_NON_BP
  );
  /*
      @description
    */
  const wsd = durationScoreWilsonScore(
    impression,
    postScoreDoc.D_score,
    Z_D,
    EV_D_PERCENTAGE
  );
  /*
      @description upvote = Sum of Upvote-Points of a Post
      downvote = Sum of Downvote-Points of a Post
    */
  const sUpDown = upDownScore(
    impression,
    postScoreDoc.upvote_point,
    postScoreDoc.downvote_point,
    W_DOWN,
    W_N
  );
  const wsupdown = upDownScoreWilsonScore(
    impression,
    sUpDown,
    Z_UPDOWN,
    EV_UPDOWN_PERCENTAGE
  );
  const pPerf = postScore(
    impression,
    wsnonbp,
    WW_NON_BP,
    wsd,
    WW_D,
    wsupdown,
    WW_UP_DOWN
  );

  postScoreDoc.s_updown_score = sUpDown;
  postScoreDoc.WS_updown_score = wsupdown;
  postScoreDoc.WS_D_score = wsd;
  postScoreDoc.WS_nonBP_score = wsnonbp;
  postScoreDoc.p_perf_score = pPerf;

  return pPerf;
};

const calcPostScore = async (postScoreDoc) => {
  console.debug("Starting calcPostScore");

  /*
    _id: feedId,
    foreign_id: "",
    time: "",
    author_id: "",
    has_link: false,
    expiration_setting: "24",
    topics: [],
    privacy: "",
    rec_score: 1.0, // recency score, based on expiration setting and now
    att_score: 1.0, // post-attributes score
    count_weekly_posts: 0.0, // total posts by user A (author) within last 7 days before this post
    impr_score: 0.0,
    domain_score: 1.0,
    longC_score: 0.0,
    p_longC_score: 1.0,
    W_score: 0.0,
    D_bench_score: 0.0,
    D_score: 0.0,
    downvote_point: 0.0,
    upvote_point: 0.0,
    s_updown_score: 0.0,
    BP_score: 0.0,
    WS_updown_score: 0.0,
    WS_D_score: 0.0,
    WS_nonBP_score: 1.0,
    p_perf_score: 1.0,
    p2_score: 0.0,
    p3_score: 1.0,
    u_score: 1.0,
    post_score: 0.0,
    created_at: timestamp,
    updated_at: timestamp,
  */

  const P_REC = process.env.P_REC || 7;
  const WLONGC = process.env.W_LONGC || 1;

  const agePost = ageOfPost(
    postScoreDoc.expiration_setting,
    postScoreDoc.time,
    new Date().toISOString()
  );
  const rec = RecencyScore(agePost, postScoreDoc.expiration_setting);
  const p = postCountScore(postScoreDoc.count_weekly_posts, P_REC);
  const p2 = scoreBasedPostCharacteristics(
    rec,
    postScoreDoc.att_score,
    postScoreDoc.domain_score,
    p,
    postScoreDoc.has_link
  );

  const pLongC = weightPostLongComments(
    postScoreDoc.longC_score,
    postScoreDoc.impr_score,
    WLONGC
  );

  // calculate post performance score
  const pPerf = calcPostPerformanceScore(postScoreDoc);

  const p3 = postPerformanceScore(pPerf, pLongC);

  // These 2 scores will be counted when the post is about to be seen by user
  const p1 = 1;
  const prev = 1;

  const final_score = finalScorePost(postScoreDoc.u_score, p1, p2, p3, prev);

  postScoreDoc.rec_score = rec;
  postScoreDoc.p2_score = p2;
  postScoreDoc.p_longC_score = pLongC;
  postScoreDoc.p3_score = p3;
  postScoreDoc.post_score = final_score;

  console.debug(
    `calcPostScore => Final post score doc: ${JSON.stringify(postScoreDoc)}`
  );
  return postScoreDoc;
};

module.exports = {
  calcPostScore,
};
