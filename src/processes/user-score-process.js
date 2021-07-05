const userScoreProcess = async (pPerf, job) => {
  const { userScore, followerScore, followersQuality, userScoreWithoutFollower, blockedPerPostImpression,
    blockpointsPerImpression, averagePostScore, multiplicationFromQualityCriteriaScore,
    postPerformanceScore, ageScore, weightPostLongComments }
    = require('../utils');
  require('dotenv').config;
  const db = require('../databases/models')
  const { UserFollowUser, StatisticPost, UserBlockedUser, Posts, PostStatistic } = require('../databases/models');
  const impression = await StatisticPost.sum('counter');
  const comment = await PostStatistic.sum('comment_count');
  const totalBlocks = await UserBlockedUser.count({ where: { user_id_blocked: job.user_id } });
  const F = await UserFollowUser.count({ where: { user_id_followed: job.user_id } });
  const countPosts = await Posts.count({ where: { author_user_id: job.user_id } });

  const WY = process.env.W_Y || 1;
  const WF = process.env.W_F || 1;
  const WB = process.env.W_B || 1;
  const WR = process.env.W_R || 1;
  const WQ = process.env.W_Q || 1;
  const WA = process.env.W_A || 1;
  const WEDU = process.env.W_EDU || 1.4;
  const WEMAIL = process.env.W_EMAIL || 1.2;
  const WTWITTER = process.env.W_TWITTER || 2;
  const WUSERATT = process.env.W_USERATT || 1;
  const WLONGC = process.env.W_LONGC || 1;
  const bpImprGlobal = process.env.BP_IMPR_GLOBAL || 0.00533333333333333;
  const bp = blockpointsPerImpression(totalBlocks, impression, bpImprGlobal);
  const b = blockedPerPostImpression(bp);
  const pLongC = weightPostLongComments(comment, impression, WLONGC);
  const postPerformance = postPerformanceScore(pPerf, pLongC);
  const r = averagePostScore(postPerformance, countPosts);
  const query = `
    select extract(day from age(current_date, u.created_at)) :: int as age_days
    from users u where user_id='${job.user_id}'`;
  const [results, _] = await db.sequelize.query(query);
  const ageAccountUser = results[0]?.age_days || 0;
  const a = ageScore(ageAccountUser);
  const q = multiplicationFromQualityCriteriaScore(WEDU, "", WEMAIL, "", WTWITTER, "", "", WUSERATT);
  const u1 = userScoreWithoutFollower(F, WF, b, WB, r, WR, q, WQ, a, WA);
  const userScoreWithoutFollowerScore = followerScore(F);
  const y = followersQuality(userScoreWithoutFollowerScore, F);
  const user_score = userScore(u1, y, WY);

  console.info(`score of user : ${user_score}`);
  return { user_score }
}

module.exports = {
  userScoreProcess
}
