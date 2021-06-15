const convertDotToSlug = (str, from, to) => {
  return str.split(from).join(to)
}

const postCountScore = (totalPostLastWeek, maxAmountPostWeekly) => {
  if(totalPostLastWeek === 0) totalPostLastWeek = 1

  return Math.min(maxAmountPostWeekly / Math.max(totalPostLastWeek,1), 1);
}

module.exports = {
  convertDotToSlug, postCountScore
}
