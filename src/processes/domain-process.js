const { postStream } = require("../services");
const { DOMAIN, convertString, postCountScore } = require('../utils')
const postToGetstream = async (activity) => {
  const { v4: uuidv4 } = require('uuid');
  try {
    let activityId = uuidv4()

    activity.actor = []
    activity.object = []
    activity.count_downvote = 0
    activity.count_upvote = 0
    activity.id = activityId
    activity.foreign_id = `${uuidv4()}${new Date().getTime()}`
    activity.verb = "post"
    activity.content_created_at = activity.content.created_at
    activity.to = ['domain:all'];

    const result = await postStream(DOMAIN, convertString(activity.domain.name, '.', '-'), activity);
    console.info('success post to getstream');
    console.info(`postId : ${activityId}`);
    return {
      ...result,
      returnActivityId: activityId
    }

  } catch (error) {
    console.info(error);
    return error;
  }
}

const setPostScore = async (user_id) => {
  try {
    const db = require('../databases/models')
    const query = `
      select sum(sp.counter) as post_score from statistic_post sp
      where sp.date > current_date - interval '7 days' and sp.user_id ='${user_id}'
    `;
    const [results, _] = await db.sequelize.query(query);
    const post_score = results[0]?.post_score || 0;
    const postRec = process.env.P_REC;
    const post_count_score = postCountScore(post_score, postRec);
    const score_post = {
      score: post_count_score * 1,
      defaults: { post_count_score }
    }
    console.info(`score : ${post_count_score * 1}, defaults : ${post_count_score}`);
    return score_post
  } catch (error) {
    console.info(error);
    return false
  }
}

module.exports = {
  postToGetstream, setPostScore
}
