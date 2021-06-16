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
const postScore = (impr, ws_nonbp, ww_nonbp, ws_d, ww_d, ws_updown, ww_updown) => {
  let p_pref = 1;
  let result_p_pref;

  if (impr < 5) {
    result_p_pref = p_pref
  } else if(impr < 50) {
    result_p_pref = p_pref * (ws_nonbp ** ww_nonbp) * (ws_d ** ww_d);
  } else {
    result_p_pref = p_pref * (ws_nonbp ** ww_nonbp) * (ws_d ** ww_d) * (ws_updown ** ww_updown);
  }

  return result_p_pref
}

/*
  @description formula for variable WS_nonBP
*/
const nonBpScoreWilsonScore = (bp, impr, z_nonbp,	ev_nonbp) => {
  ev_nonbp = ev_nonbp / 100;
  return (((1-(bp/impr)) + (z_nonbp**2/(2*impr))) / (1+(z_nonbp**2)/impr)) /  ev_nonbp;
}

/*
  @description formula for variable s_updown
*/
const upDownScore = (impr, upvote, downvote, w_down, w_n) => {
  return ((-impr * w_down) + upvote + (downvote*w_down) + w_n * (impr - upvote - downvote)) / (impr * (1-w_down));
}

/*
  @description formula for variable p3
*/
const postPerformanceScore = (p_perf, p_longC) => {
  return p_perf * p_longC
}

module.exports = {
  postCountScore, postScore, upDownScore, postPerformanceScore
}
