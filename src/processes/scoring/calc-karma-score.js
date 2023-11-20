const {getDb} = require('../../config/mongodb_conn');
const {DB_COLLECTION_USER_SCORE} = require('../scoring-constant');
const UsersFunction = require('../../databases/functions/users');

const KARMA_SCORE_MULTIPLIER = 7.3;
const KARMA_SCORE_EXPONENT = 0.57;

const calculateP = (p) => {
  let P = Number(p);
  P = P === 0 ? 1 : P;
  return P;
};

const getUserScore = (user) => {
  return user && typeof user?.user_score === 'number' ? user.user_score : 0;
};
const combinedUserScore = async (userId, userScoreCol, sign_user_score) => {
  console.log('Start calculating combined user score');
  const userIds = [userId];
  const anonymousUserId = await UsersFunction.findAnonymousUserId(userId);
  if (anonymousUserId) {
    userIds.push(anonymousUserId);
  }
  const users = await userScoreCol.find({_id: {$in: userIds}}).toArray();

  const userExists1 = users[0];
  const userExists2 = users.length > 1 && users[1];
  const P1 = userExists1 ? calculateP(users[0].last_posts?.counter) : 1;
  const P2 = userExists2 ? calculateP(users[1].last_posts?.counter) : 1;

  const u_score1 = sign_user_score || getUserScore(users[0]);
  const u_score2 = getUserScore(users[1]);
  // return u_score1;
  return (u_score1 * P1 + u_score2 * P2) / (P1 + P2);
};

const percentileUserScore = async (targetScore, userScoreCol) => {
  console.log('Start calculating percentile user score');
  // Need to change to combined score and filter to only sign user.
  const [usersWithLowerScore, totalUsers] = await Promise.all([
    userScoreCol.countDocuments({combined_user_score: {$lte: targetScore}, is_anonymous: false}),
    userScoreCol.countDocuments({is_anonymous: false})
  ]);
  const percentile = totalUsers === 0 ? 0 : (usersWithLowerScore / totalUsers) * 100;
  return percentile;
};

const setUserKarmaScore = async (
  userId,
  combined_user_score,
  karma_score,
  userScoreCol,
  percentileScore
) => {
  // save data to db
  await UsersFunction.userSetKarmaScore(userId, combined_user_score, karma_score);
  // save data to user score doc
  const updateResult = await userScoreCol.updateOne(
    {_id: userId},
    {
      $set: {
        combined_user_score,
        karma_score,
        percentileScore
      }
    },
    {upsert: false}
  );
  console.debug(`Update user score doc result: ${JSON.stringify(updateResult)}`);
  return updateResult;
};

const calcKarmaScore = async (userId, sign_user_score = null) => {
  const db = await getDb();
  const userScoreCol = db.collection(DB_COLLECTION_USER_SCORE);

  const user = await UsersFunction.getUserByUserId(userId);
  if (!user || user?.is_anonymous) {
    return null;
  }
  const combined_user_score = await combinedUserScore(userId, userScoreCol, sign_user_score);
  const percentileScore = await percentileUserScore(combined_user_score, userScoreCol);
  const karma_score = KARMA_SCORE_MULTIPLIER * percentileScore ** KARMA_SCORE_EXPONENT;
  await setUserKarmaScore(userId, combined_user_score, karma_score, userScoreCol, percentileScore);
  return karma_score;
};

module.exports = {
  calcKarmaScore
};
