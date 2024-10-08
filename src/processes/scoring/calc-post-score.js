require('dotenv').config();
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
  upDownScore
} = require('../../utils');

const calcPostPerformanceScore = (postScoreDoc) => {
  const impression = postScoreDoc.impr_score === 0 ? 1 : postScoreDoc.impr_score;

  /*
      @description block point get from table post_blocked
    */
  const wsnonbp = nonBpScoreWilsonScore(postScoreDoc.BP_score, impression);
  /*
      @description
    */
  const wsd = durationScoreWilsonScore(impression, postScoreDoc.D_score);
  /*
      @description upvote = Sum of Upvote-Points of a Post
      downvote = Sum of Downvote-Points of a Post
    */
  const sUpDown = upDownScore(impression, postScoreDoc.upvote_point, postScoreDoc.downvote_point);
  const wsupdown = upDownScoreWilsonScore(impression, sUpDown);
  const pPerf = postScore(impression, wsnonbp, wsd, wsupdown);

  postScoreDoc.s_updown_score = sUpDown;
  postScoreDoc.WS_updown_score = wsupdown;
  postScoreDoc.WS_D_score = wsd;
  postScoreDoc.WS_nonBP_score = wsnonbp;
  postScoreDoc.p_perf_score = pPerf;

  return pPerf;
};

const calcPostScore = async (postScoreDoc) => {
  console.debug('Starting calcPostScore');

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

  const pLongC = weightPostLongComments(postScoreDoc.longC_score, postScoreDoc.impr_score, WLONGC);

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

  // console.debug(`calcPostScore => Final post score doc: ${JSON.stringify(postScoreDoc)}`);
  return postScoreDoc;
};

module.exports = {
  calcPostScore,
  calcPostPerformanceScore
};
