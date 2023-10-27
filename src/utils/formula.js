const moment = require('moment');
const {
  USER_SCORE_WEIGHT,
  POST_SCORE_P1_WEIGHT,
  POST_SCORE_P2_WEIGHT,
  POST_SCORE_P3_WEIGHT,
  FINAL_SCORE_WEIGHT,
  REACTION_WEIGHT
} = require('../processes/scoring/formula/constant');

const safeValue = (number) => {
  return number === 0 ? 1 : number;
};

/*
  @description formula for variable P
*/
const postCountScore = (totalPostLastWeek, maxAmountPostWeekly) => {
  return Math.min(maxAmountPostWeekly / Math.max(totalPostLastWeek, 1), 1);
};

/*
  @description formula for variable p_perf
*/
const postScore = (impr, wsNonBp, wsD, wsUpdown) => {
  let p_perf = 1;

  if (impr >= 5) {
    if (impr < 50) {
      p_perf = wsNonBp ** POST_SCORE_P3_WEIGHT.WW_NON_BP * wsD ** POST_SCORE_P3_WEIGHT.WW_D;
    } else {
      p_perf =
        wsNonBp ** POST_SCORE_P3_WEIGHT.WW_NON_BP *
        wsD ** POST_SCORE_P3_WEIGHT.WW_D *
        wsUpdown ** POST_SCORE_P3_WEIGHT.WW_UP_DOWN;
    }
  }

  return p_perf;
};

/*
  @description formula for variable p_longC
*/
const weightPostLongComments = (longC, impr, wlongC) => {
  // weight rewarding if a post has long comments (>80char)
  let pLongC;
  if (impr === 0) {
    pLongC = 1;
  } else {
    pLongC = (1 + longC / impr) ** wlongC;
  }
  return pLongC;
};

/*
  @description formula for variable WS_updown
*/
const upDownScoreWilsonScore = (impr, sUpDown) => {
  if (impr === 0) {
    return 1;
  }

  const evUpDownPercentage = POST_SCORE_P3_WEIGHT.EV_UP_DOWN / 100;
  const result =
    (sUpDown + POST_SCORE_P3_WEIGHT.Z_UP_DOWN ** 2 / (2 * impr)) /
    (1 + POST_SCORE_P3_WEIGHT.Z_UP_DOWN ** 2 / impr) /
    evUpDownPercentage;

  return result;
};

/*
  @description formula for variable WS_D
*/
const durationScoreWilsonScore = (impr, duration) => {
  if (impr === 0) {
    return 1;
  }
  const duration_distribution = POST_SCORE_P3_WEIGHT.EV_D / 100;
  return (
    (duration / impr + POST_SCORE_P3_WEIGHT.Z_D ** 2 / (2 * impr)) /
    (1 + POST_SCORE_P3_WEIGHT.Z_D ** 2 / impr) /
    duration_distribution
  );
};

/*
  @description formula for variable WS_nonBP
*/
const nonBpScoreWilsonScore = (bp, impr) => {
  if (impr === 0) {
    return 1;
  }
  const evNonBp = POST_SCORE_P3_WEIGHT.EV_NON_BP / 100;
  return (
    (1 - bp / impr + POST_SCORE_P3_WEIGHT.Z_NON_BP ** 2 / (2 * impr)) /
    (1 + POST_SCORE_P3_WEIGHT.Z_NON_BP ** 2 / impr) /
    evNonBp
  );
};

/*
  @description formula for variable sUpDown
*/
const upDownScore = (impr, upvote, downvote) => {
  if (impr === 0) {
    return 1;
  }

  return (
    (-impr * POST_SCORE_P3_WEIGHT.W_DOWN +
      upvote +
      downvote * POST_SCORE_P3_WEIGHT.W_DOWN +
      POST_SCORE_P3_WEIGHT.W_N * (impr - upvote - downvote)) /
    (impr * (1 - POST_SCORE_P3_WEIGHT.W_DOWN))
  );
};

/*
  @description formula for variable p3
*/
const postPerformanceScore = (pPerf, pLongC) => {
  return pPerf * pLongC;
};

/*
  @description
  D_bench:
  Benchmark a post impression has to reach so that it’s counted as #D
  Benchmark untuk ‘durasi diharapkan’ dari post kalau postnya menarik
  =dur_min+dur_marg*#W
  #dur_min, dur_marg --> constant values
  #  #W: jumlah kata dalam postnya (jgn termasuk kata2 dalam link, cuma yg ngetip dari user)
*/
const dBench = (dur_min, dur_marg, W) => {
  // dur_min * 1.0 --> just to make sure the env var will be read as number, not as text
  return dur_min * 1.0 + dur_marg * W;
};

/*
  @description formula for variable u
*/
const userScore = (u1, y, userDoc) => {
  let user_score = u1 * y ** USER_SCORE_WEIGHT.W_Y;
  if (userDoc.blocked_by_admin?.status) {
    user_score *= USER_SCORE_WEIGHT.W_PU;
  }
  return user_score;
};

/*
  @description formula for variable T_t
*/
const finalScorePost = (u_score, p1, p2, p3, prev) => {
  return (
    safeValue(u_score) ** FINAL_SCORE_WEIGHT.W_U *
    safeValue(p1) ** FINAL_SCORE_WEIGHT.W_P1 *
    safeValue(p2) ** FINAL_SCORE_WEIGHT.W_P2 *
    safeValue(p3) ** FINAL_SCORE_WEIGHT.W_P3 *
    safeValue(prev) ** FINAL_SCORE_WEIGHT.W_PREV
  );
};

/*
  @description formula for variable f
*/
const followerScore = (followersCount) => {
  return ((followersCount + 1) / 150) ** 0.05;
};

/*
  @description formula for variable b
*/
const blockedPerPostImpression = (blockpointsPerImpression) => {
  return 2 / (1 + 200 ** (blockpointsPerImpression ** 0.4 - 1));
};

/*
  @description formula for variable BPpImpr_un
*/
const blockpointsPerImpression = (all_blockpoints, all_impr) => {
  if (all_impr === 0) {
    return 0;
  }
  return all_blockpoints / all_impr / USER_SCORE_WEIGHT.BP_IMPR_GLOBAL;
};

/*
  @description formula for variable r
*/
const averagePostScore = (postPerformanceScoreValue, countPosts) => {
  if (countPosts === 0) {
    return 1;
  }
  return (postPerformanceScoreValue + (10 - Math.min(10, countPosts))) / 10 || 1;
};

/*
  @description formula for variable q
*/
const multiplicationFromQualityCriteriaScore = (
  wEdu,
  eduEmail,
  wEmail,
  wTwitter,
  followerTwitter,
  email,
  wUserAtt
) => {
  let verifiedEdu;
  let twitter;
  if (eduEmail) {
    verifiedEdu = wEdu ** 1;
  } else {
    verifiedEdu = wEdu ** 0;
  }
  const verifiedEmail = wEmail ** (Math.min(3, email) ** 0.25);
  if (followerTwitter > 200) {
    twitter = wTwitter ** 1;
  } else {
    twitter = wTwitter ** 0;
  }

  const result = verifiedEdu * verifiedEmail * twitter * wUserAtt;
  return result;
};

/*
  @description formula for variable u1
*/
const userScoreWithoutFollower = (f, b, r, q, a) => {
  return (
    f ** USER_SCORE_WEIGHT.W_F *
      b ** USER_SCORE_WEIGHT.W_B *
      r ** USER_SCORE_WEIGHT.W_R *
      q ** USER_SCORE_WEIGHT.W_Q *
      a ** USER_SCORE_WEIGHT.W_A || 1
  );
};

/*
  @description formula for variable y
*/
const followersQuality = (userScoreWithoutFollowerScore, followersCount) => {
  // TODO pastikan input nya
  return userScoreWithoutFollowerScore / followersCount;
};

/*
  @description formula for variable p1
*/
const applyMultipliesToTotalScore = (
  topicFollowed,
  userFollowAuthor,
  followAuthorFollower,
  followDomain
) => {
  let result = 1;

  // multiplier by #topicFollowed
  if (topicFollowed > 0) {
    result *= POST_SCORE_P1_WEIGHT.W_TOPIC ** (topicFollowed ** 0.5);
  }

  // multiplier by follow status of the user
  if (userFollowAuthor) {
    result *= POST_SCORE_P1_WEIGHT.W_FOLLOWS;
  } else if (followAuthorFollower) {
    result *= POST_SCORE_P1_WEIGHT.W_2DEGREE;
  }

  if (followDomain) {
    result *= POST_SCORE_P1_WEIGHT.W_LINK_DOMAIN;
  }

  return result;
};

/*
  @description formula for variable p2
*/
const scoreBasedPostCharacteristics = (rec, att, d, p, postLink) => {
  // console.log("rec:"+rec+", wRec:"+wRec+", att:"+att+", wAtt:"+wAtt+", d:"+d+", wD:"+wD+", p:"+p+", wP:"+wP+", postLink:"+postLink);
  let result =
    rec ** POST_SCORE_P2_WEIGHT.W_REC *
    att ** POST_SCORE_P2_WEIGHT.W_ATT *
    p ** POST_SCORE_P2_WEIGHT.W_P;
  if (postLink) {
    result *= d ** POST_SCORE_P2_WEIGHT.W_D;
  }

  return result;
};

/*
  @description formula for variable p_perv
*/
const previousInteractionScore = (prevInteract, prevD, prevUc, prevPre) => {
  if (prevInteract === 'seen') {
    return prevPre;
  }
  if (prevInteract === 'downvote') {
    return prevD;
  }
  if (prevInteract === 'upvote' || prevInteract === 'comment') {
    return prevUc;
  }
  return 1; // none interaction
};

/*
  @description formula for variable Rec
*/
const RecencyScore = (ageOfPost, expirationSetting) => {
  if (expirationSetting === '1') {
    return 1 - 0.007 * ageOfPost;
  }
  if (expirationSetting === '7') {
    return 1.3 - 0.4 * ageOfPost ** 0.15;
  }
  if (expirationSetting === '30') {
    return 0.95 - 0.225 * ageOfPost ** 0.215;
  }
  if (expirationSetting === 'never') {
    return Math.max(0.02, 0.95 - 0.225 * ageOfPost ** 0.215);
  }
};

/*
  @description formula for variable t
*/
const ageOfPost = (expirationSetting, postDateTime, nowDateTime) => {
  const diffHours = Math.trunc(
    moment.duration(moment.utc(nowDateTime).diff(moment.utc(postDateTime))).as('hours')
  );

  if (expirationSetting === 'never') {
    return Math.max(1, diffHours);
  }
  return Math.min(expirationSetting * 24, Math.max(1, diffHours));
};

const ageScore = (age) => {
  let resultAgeScore;
  if (age < 365) {
    resultAgeScore = 0.4 + 0.6 * (age / 365);
  } else {
    resultAgeScore = 1;
  }

  return resultAgeScore;
};

/*
  @description formula for calculating post interaction (upvote / downvote / block) point
*/
const postInteractionPoint = (totalInteractionLast7Days, iteractionType) => {
  if (totalInteractionLast7Days <= 0) {
    return 0;
  }

  let maxInteractionWeekly;
  switch (iteractionType) {
    case 'upvote':
      maxInteractionWeekly = REACTION_WEIGHT.SIGN_U_REC;
      break;
    case 'downvote':
      maxInteractionWeekly = REACTION_WEIGHT.SIGN_D_REC;
      break;
    case 'block':
      maxInteractionWeekly = REACTION_WEIGHT.SIGN_B_REC;
      break;
    default:
      return 1;
  }

  if (totalInteractionLast7Days <= maxInteractionWeekly) {
    return 1;
  }
  return maxInteractionWeekly / totalInteractionLast7Days;
};

module.exports = {
  postCountScore,
  postScore,
  weightPostLongComments,
  upDownScoreWilsonScore,
  durationScoreWilsonScore,
  postInteractionPoint,
  nonBpScoreWilsonScore,
  upDownScore,
  postPerformanceScore,
  dBench,
  userScore,
  userScoreWithoutFollower,
  followerScore,
  followersQuality,
  blockedPerPostImpression,
  blockpointsPerImpression,
  averagePostScore,
  ageScore,
  multiplicationFromQualityCriteriaScore,
  finalScorePost,
  previousInteractionScore,
  applyMultipliesToTotalScore,
  scoreBasedPostCharacteristics,
  RecencyScore,
  ageOfPost
};
