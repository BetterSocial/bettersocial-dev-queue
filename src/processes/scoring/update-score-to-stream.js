const updateScoreToStream = async (postScoreDoc) => {
  const {putStream} = require('../../services/updateStream');

  try {
    const scoreDetails = {...postScoreDoc};
    scoreDetails.author_id = undefined;
    const set = {
      score: postScoreDoc.p2_score,
      user_score: postScoreDoc.u_score,
      post_performance_comments_score: postScoreDoc.p_perf_score,
      final_score: postScoreDoc.post_score,
      score_details: scoreDetails
    };
    await putStream(postScoreDoc._id, set);
    console.debug(`updated main_feed:${postScoreDoc._id}`);
  } catch (error) {
    console.error(error);
    throw error;
  }
};

module.exports = {
  updateScoreToStream
};
