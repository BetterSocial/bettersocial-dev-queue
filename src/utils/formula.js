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
    result_p_pref = p_pref
  } else if (impr < 50) {
    result_p_pref = p_pref * (wsNonBp ** wwNonBp) * (wsD ** wwD);
  } else {
    result_p_pref = p_pref * (wsNonBp ** ww_nonbp) * (ws_d ** ww_d) * (wsUpdown ** wwUpdown);
  }

  return result_p_pref
}

/*
  @description formula for variable p_longC
*/
const weightPostLongComments = (longC, impr, wlongC) => {
  // weight rewarding if a post has long comments (>80char)
  return (1 + (longC / impr)) ** wlongC;
}

/*
  @description formula for variable WS_updown
*/
const upDownScoreWilsonScore = (impr, sUpDwon, zUpDown, evUpDown) => {
  const evUpDownPercentage = evUpDown / 100;
  const result = ((sUpDwon + (zUpDown ** 2 / (2 * impr))) / (1 + (zUpDown ** 2) / impr)) / evUpDownPercentage;

  return result;
}
/*
  @description formula for variable WS_D
*/
const DurationScoreWilsonScore = (impr, duration, zValueDurationDist, durationDistributionPercentage) => {
  duration_distribution = durationDistributionPercentage / 100;
  if (impr == 0) {
    return 1;
  } else {
    return ((((duration / impr) + (zValueDurationDist ** 2 / (2 * impr))) / (1 + (zValueDurationDist ** 2) / impr)) / duration_distribution);
  }
}

/*
  @description formula for variable WS_nonBP
*/
const nonBpScoreWilsonScore = (bp, impr, zNonbp, evNonBp) => {
  evNonBp = evNonBp / 100;
  return (((1 - (bp / impr)) + (zNonbp ** 2 / (2 * impr))) / (1 + (zNonbp ** 2) / impr)) / evNonBp;
}

/*
  @description formula for variable sUpDwon
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

module.exports = {
  postCountScore, postScore, weightPostLongComments,
  upDownScoreWilsonScore, DurationScoreWilsonScore,
  nonBpScoreWilsonScore, upDownScore, postPerformanceScore
}
