const updateScoreToStream = async (postScoreDoc) => {
  const { putStream } = require('../../services');

  try {
    const set = {
      score: postScoreDoc.p2_score,
      user_score: postScoreDoc.u_score,
      post_performance_comments_score: postScoreDoc.p_perf_score,
      final_score: postScoreDoc.post_score,
    }
    await putStream(postScoreDoc._id, set);
    console.debug(`updated main_feed:${postScoreDoc._id}`);
  } catch (error) {
    console.error(error);
    throw error;
  }
}

module.exports = {
  updateScoreToStream
}
