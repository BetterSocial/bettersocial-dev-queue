const postCountScore = (totalPostLastWeek, maxAmountPostWeekly) => {
  if (totalPostLastWeek === 0) totalPostLastWeek = 1

  return Math.min(maxAmountPostWeekly / Math.max(totalPostLastWeek, 1), 1);
}

const postScore = (impr, ws_nonBP, ww_nonBP, ws_D, ww_D, ws_updown, ww_updown) => {
  let p_pref = 1;
  let result_p_pref;

  if (impr < 5) {
    result_p_pref = p_pref
  } else if(impr < 50) {
    result_p_pref = p_pref * (ws_nonBP ** ww_nonBP) * (ws_D ** ww_D);
  } else {
    result_p_pref = p_pref * (ws_nonBP ** ww_nonBP) * (ws_D ** ww_D) * (ws_updown ** ww_updown);
  }

  return result_p_pref
}

module.exports = {
  postCountScore
}
