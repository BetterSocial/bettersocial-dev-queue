require("dotenv").config();
const {
  userScoreConstant,
  postScoreP3Constant,
} = require("./scoring/formula/constant");
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
  weightPostLongComments,
} = require("../utils");
const db = require("../databases/models");
const {
  UserFollowUser,
  StatisticPost,
  UserBlockedUser,
  Posts,
  PostStatistic,
} = require("../databases/models");

const userScoreProcess = async (pPerf, job) => {
  const impression = await StatisticPost.sum("counter");
  const comment = await PostStatistic.sum("comment_count");
  const totalBlocks = await UserBlockedUser.count({
    where: { user_id_blocked: job.user_id },
  });
  const F = await UserFollowUser.count({
    where: { user_id_followed: job.user_id },
  });
  const countPosts = await Posts.count({
    where: { author_user_id: job.user_id },
  });

  const bp = blockpointsPerImpression(
    totalBlocks,
    impression,
    userScoreConstant.BpImpr_Global
  );
  const b = blockedPerPostImpression(bp);
  const pLongC = weightPostLongComments(
    comment,
    impression,
    postScoreP3Constant.w_longC
  );
  const postPerformance = postPerformanceScore(pPerf, pLongC);
  const r = averagePostScore(postPerformance, countPosts);
  const query = `
    select extract(day from age(current_date, u.created_at)) :: int as age_days
    from users u where user_id='${job.user_id}'`;
  const [results, _] = await db.sequelize.query(query);
  const ageAccountUser = results[0]?.age_days || 0;
  const a = ageScore(ageAccountUser);
  const q = multiplicationFromQualityCriteriaScore(
    userScoreConstant.w_edu,
    "",
    userScoreConstant.w_email,
    "",
    userScoreConstant.w_twitter,
    "",
    "",
    userScoreConstant.w_useratt
  );
  const u1 = userScoreWithoutFollower(
    F,
    userScoreConstant.w_f,
    b,
    userScoreConstant.w_b,
    r,
    userScoreConstant.w_r,
    q,
    userScoreConstant.w_q,
    a,
    userScoreConstant.w_a
  );
  const userScoreWithoutFollowerScore = followerScore(F);
  const y = followersQuality(userScoreWithoutFollowerScore, F);
  const user_score = userScore(u1, y, userScoreConstant.w_y);

  console.info(`score of user : ${user_score}`);
  return { user_score };
};

module.exports = {
  userScoreProcess,
};
