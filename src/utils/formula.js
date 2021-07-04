/*
  @description formula for variable P
*/
const postCountScore = (totalPostLastWeek, maxAmountPostWeekly) => {
  if (totalPostLastWeek === 0) totalPostLastWeek = 1

  return Math.min(maxAmountPostWeekly / Math.max(totalPostLastWeek, 1), 1);
}

/*
  @description formula for variable p_perf
*/
const postScore = (impr, wsNonBp, wwNonBp, wsD, wwD, wsUpdown, wwUpdown) => {
  let p_pref = 1;
  let result_p_pref;

  if (impr < 5) {
    result_p_pref = p_pref;
  } else if (impr < 50) {
    result_p_pref = p_pref * (wsNonBp ** wwNonBp) * (wsD ** wwD);
  } else {
    result_p_pref = p_pref * (wsNonBp ** ww_nonbp) * (ws_d ** ww_d) * (wsUpdown ** wwUpdown);
  }

  return result_p_pref;
}

/*
  @description formula for variable p_longC
*/
const weightPostLongComments = (longC, impr, wlongC) => {
  // weight rewarding if a post has long comments (>80char)
  let pLongC
  if(impr === 0) {
    pLongC = 1;
  } else {
    pLongC = (1 + (longC / impr)) ** wlongC;
  }
  return pLongC;
}

/*
  @description formula for variable WS_updown
*/
const upDownScoreWilsonScore = (impr, sUpDown, zUpDown, evUpDown) => {
  const evUpDownPercentage = evUpDown / 100;
  const result = ((sUpDown + (zUpDown ** 2 / (2 * impr))) / (1 + (zUpDown ** 2) / impr)) / evUpDownPercentage;

  return result;
}

/*
  @description formula for variable WS_D
*/
const durationScoreWilsonScore = (impr, duration, zValueDurationDist, durationDistributionPercentage) => {
  if (impr === 0) {
    return 1;
  } else {
    duration_distribution = durationDistributionPercentage / 100;
    return ((((duration / impr) + (zValueDurationDist ** 2 / (2 * impr))) / (1 + (zValueDurationDist ** 2) / impr)) / duration_distribution);
  }
}

/*
  @description formula for variable WS_nonBP
*/
const nonBpScoreWilsonScore = (bp, impr, zNonbp, evNonBp) => {
  if (impr === 0) {
    return 1
  } else {
    evNonBp = evNonBp / 100;
    return (((1 - (bp / impr)) + (zNonbp ** 2 / (2 * impr))) / (1 + (zNonbp ** 2) / impr)) / evNonBp;
  }
}

/*
  @description formula for variable sUpDown
*/
const upDownScore = (impr, upvote, downvote, wDown, wN) => {
  return ((-impr * wDown) + upvote + (downvote * wDown) + wN * (impr - upvote - downvote)) / (impr * (1 - wDown));
}

/*
  @description formula for variable p3
*/
const postPerformanceScore = (pPerf, pLongC) => {
  return pPerf * pLongC
}

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
  return dur_min + dur_marg * W
}

/*
  @description formula for variable u
*/
const userScore = (u1, y, wy) => {
  return u1 * y ** wy
}

/*
  @description formula for variable T_t
*/
const finalScorePost = (userScore, weightUserScroe, p1, weightp1, p2, weightp2, p3, weightp3, prev, weightprev) => {
  return userScore ** weightUserScroe * p1 ** weightp1 * p2 ** weightp2 * p3 ** weightp3 * prev ** weightprev;
}

/*
  @description formula for variable f
*/
const followerScore = (followersCount) => {
  return (followersCount / 150) ** (0.05);
}

/*
  @description formula for variable b
*/
const blockedPerPostImpression = (blockpointsPerImpression) => {
  return 2 / (1 + 200 ** (blockpointsPerImpression ** 0.4 - 1));
}

/*
  @description formula for variable BPpImpr_un
*/
const blockpointsPerImpression = (totalBlocks, impr, bpImprGlobal) => {
  if (impr == 0) {
    return 0;
  } else {
    return (totalBlocks / impr) / bpImprGlobal;
  }
}

/*
  @description formula for variable r
*/
const averagePostScore = (postPerformanceScore, countPosts) => {
  if (countPosts == 0) {
    return 1;
  } else {
    return (postPerformanceScore + (10 - Math.min(10, countPosts))) / 10;
  }
}

/*
  @description formula for variable q
*/
const multiplicationFromQualityCriteriaScore = (wEdu, eduEmail, wEmail, wTwitter, followerTwitter, email, wUserAtt) => {
  let verifiedEdu
  let twitter
  if (eduEmail) {
    verifiedEdu = wEdu ** 1;
  } else {
    verifiedEdu = wEdu ** 0;
  }
  const veridiedEmail = wEmail ** (Math.min(3, email) ** 0.25);
  if (followerTwitter > 200) {
    twitter = wTwitter ** 1;
  } else {
    twitter = wTwitter ** 0;
  }

  const result = verifiedEdu * veridiedEmail * twitter * wUserAtt;
  return result;
}

/*
  @description formula for variable u1
*/
const userScoreWithoutFollower = (f, wF, b, wB, r, wR, q, wQ, a, wA) => {
  return (f ** wF) * (b ** wB) * (r ** wR) * (q ** wQ) * (a ** wA);
}

/*
  @description formula for variable y
*/
const followersQuality = (userScoreWithoutFollowerScore, followersCount) => {
  //TODO pastikan input nya
  return userScoreWithoutFollowerScore / followersCount;
}

/*
  @description formula for variable p1
*/
const applyMultipliesToTotalScore = (wTopic, topicFollowed, wFollow, wDegree, wLinkDomain, userFollowAuthor, followAuthorFollower, linkPost) => {
  const constant = 0.5;
  const followedTopic = wTopic ** (topicFollowed ** constant);
  let calculate
  if (userFollowAuthor) {
    calculate = followedTopic * wFollow;
  }
  else if (followAuthorFollower == 1) {
    calculate = followedTopic * wDegree;
  }
  else {
    calculate = followedTopic * 1;
  }
  const result = calculate * wLinkDomain ** linkPost;
  return result;
}

/*
  @description formula for variable p2
*/
const scoreBasedPostCharacteristics = (rec, wRec, att, wAtt, d, wD, p, wP, postLink) => {
  const formula = rec ** wRec * att ** wAtt;
  let result
  if (postLink) {
    result = formula * d ** wD;
  } else {
    result = formula * 1 * p ** wP;
  }
  return result;
}

/*
  @description formula for variable p_perv
*/
const previousInteractionScore = (prevInteract, prevD, prevUc, prevPre) => {
  if (prevInteract == 'seen') {
    return prevPre;
  } else if (prevInteract == 'downvote') {
    return prevD;
  } else if (prevInteract == 'upvote' || prevInteract == 'comment') {
    return prevUc;
  } else {
    return 1;   //none interaction
  }
}

/*
  @description formula for variable Rec
*/
const RecencyScore = (ageOfPost, expirationSetting) => {
  if (expirationSetting == 1) {
    return 1 - 0.007 * ageOfPost;
  } else if (expirationSetting == 7) {
    return 1.3 - 0.4 * ageOfPost ** 0.15;
  } else if (expirationSetting == 30) {
    return 0.95 - 0.225 * ageOfPost ** 0.215;
  } else if (expirationSetting == 'forever') {
    return max(0.02, 0.95 - 0.225 * ageOfPost ** 0.215);
  }
}

/*
  @description formula for variable t
*/
const ageOfPost = (expirationSetting, postDateTime, nowDateTime) => {
  diffDays = (Date.parse(nowDateTime) - Date.parse(postDateTime)) / 60 / 60 / 24;

  if(expirationSetting == "forever") {
    return max(1, diffDays);
  } else {
    return min(expirationSetting, max(1, diffDays));
  }
}

const ageScore = (age) => {
  let resultAgeScore
  if (age < 365) {
    resultAgeScore = 0.4 + 0.6 * (age / 365)
  } else {
    resultAgeScore = 1
  }

  return resultAgeScore
}

module.exports = {
  postCountScore, postScore, weightPostLongComments,
  upDownScoreWilsonScore, durationScoreWilsonScore,
  nonBpScoreWilsonScore, upDownScore, postPerformanceScore,
  dBench, userScore, userScoreWithoutFollower, followerScore, followersQuality,
  blockedPerPostImpression, blockpointsPerImpression, averagePostScore, ageScore,
  multiplicationFromQualityCriteriaScore
}
