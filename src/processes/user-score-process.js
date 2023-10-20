// This code is no longer used and change to calcUserScore
require('dotenv').config();
const {USER_SCORE_WEIGHT, POST_SCORE_P3_WEIGHT} = require('./scoring/formula/constant');
const {
  userScore,
  followerScore,
  followersQuality,
  userScoreWithoutFollower,
  blockedPerPostImpression,
  blockpointsPerImpression,
  averagePostScore,
  multiplicationFromQualityCriteriaScore,
  postPerformanceScore,
  ageScore,
  weightPostLongComments
} = require('../utils');
const db = require('../databases/models');
const {
  UserFollowUser,
  StatisticPost,
  UserBlockedUser,
  Posts,
  PostStatistic
} = require('../databases/models');

const userScoreProcess = async (pPerf, job) => {
  const impression = await StatisticPost.sum('counter');
  const comment = await PostStatistic.sum('comment_count');
  const totalBlocks = await UserBlockedUser.count({
    where: {user_id_blocked: job.user_id}
  });
  const F = await UserFollowUser.count({
    where: {user_id_followed: job.user_id}
  });
  const countPosts = await Posts.count({
    where: {author_user_id: job.user_id}
  });

  const bp = blockpointsPerImpression(totalBlocks, impression);
  const b = blockedPerPostImpression(bp);
  const pLongC = weightPostLongComments(comment, impression, POST_SCORE_P3_WEIGHT.W_LONG_C);
  const postPerformance = postPerformanceScore(pPerf, pLongC);
  const r = averagePostScore(postPerformance, countPosts);
  const query = `
    select extract(day from age(current_date, u.created_at)) :: int as age_days
    from users u where user_id='${job.user_id}'`;
  const [results, _] = await db.sequelize.query(query);
  const ageAccountUser = results[0]?.age_days || 0;
  const a = ageScore(ageAccountUser);
  const q = multiplicationFromQualityCriteriaScore(
    USER_SCORE_WEIGHT.W_EDU,
    '',
    USER_SCORE_WEIGHT.W_EMAIL,
    '',
    USER_SCORE_WEIGHT.W_TWITTER,
    '',
    '',
    USER_SCORE_WEIGHT.W_USERATT
  );
  const u1 = userScoreWithoutFollower(F, b, r, q, a);
  const userScoreWithoutFollowerScore = followerScore(F);
  const y = followersQuality(userScoreWithoutFollowerScore, F);
  const user_score = userScore(u1, y);

  console.info(`score of user : ${user_score}`);
  return {user_score};
};

module.exports = {
  userScoreProcess
};
