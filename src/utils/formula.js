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
  return (1 + (longC / impr)) ** wlongC;
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

module.exports = {
  postCountScore, postScore, weightPostLongComments,
  upDownScoreWilsonScore, durationScoreWilsonScore,
  nonBpScoreWilsonScore, upDownScore, postPerformanceScore,
  dBench
}
