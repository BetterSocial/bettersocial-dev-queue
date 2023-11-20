module.exports = {
  ...require('./blockUser'),
  ...require('./unblockUser'),
  ...require('./upvotePost'),
  ...require('./cancelUpvotePost'),
  ...require('./downvotePost'),
  ...require('./cancelDownvotePost'),
  ...require('./triggerDailyScoring'),
  ...require('./updateUserScoreOnDailyProcessPhase1'),
  ...require('./updateUserScoreOnDailyProcessPhase2'),
  ...require('./removeActivity')
};
