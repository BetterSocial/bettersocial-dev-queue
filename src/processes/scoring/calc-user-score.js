const moment = require('moment');
const {
  userScore,
  followerScore,
  userScoreWithoutFollower,
  blockedPerPostImpression,
  blockpointsPerImpression,
  ageScore
} = require('../../utils');
const {calcKarmaScore} = require('./calc-karma-score');

const updateLastp3Scores = (userScoreDoc, postScoreDoc) => {
  const p3scoreSubDoc = userScoreDoc.last_p3_scores[postScoreDoc._id];
  if (p3scoreSubDoc) {
    p3scoreSubDoc.p3_score = postScoreDoc.p3_score;
  }

  return userScoreDoc;
};

const calcUserScore = async (userDoc) => {
  console.debug('Starting calcUserScore');
  const ageAccountUser = Math.trunc(
    moment
      .duration(moment().utc().diff(moment.utc(userDoc.register_time, 'YYYY-MM-DD HH:mm:ss', true)))
      .as('days')
  );

  // Calculate variables not yet calculated for getting the user score

  const f = followerScore(userDoc.F_score); // ASK: should check follower number from db and ask about the validity of the formula
  const BPpImpr_un = blockpointsPerImpression(userDoc.sum_BP_score, userDoc.sum_impr_score);
  const b = blockedPerPostImpression(BPpImpr_un);
  const a = ageScore(ageAccountUser);
  const u1 = userScoreWithoutFollower(f, b, userDoc.r_score, userDoc.q_score, a);
  const user_score = userScore(u1, userDoc.y_score, userDoc);
  console.debug(
    `Calculation result ageAccountUser=${ageAccountUser}, f=${f}, BPpImpr_un=${BPpImpr_un}, b=${b}, a=${a}, u1=${u1}`
  );

  // Put the calculation result in the user doc
  userDoc.u1_variable = {
    f,
    b,
    r_score: userDoc.r_score,
    q_score: userDoc.q_score,
    a
  };
  userDoc.b = b;
  userDoc.BPpImpr_un = BPpImpr_un;
  userDoc.age_score = ageAccountUser;
  userDoc.u1_score = u1;
  userDoc.user_score = user_score;

  // update combined user score and karma score
  calcKarmaScore(userDoc._id, user_score);

  console.debug(`calcUserScore: Final user doc: ${JSON.stringify(userDoc)}`);

  return userDoc;
};

module.exports = {
  calcUserScore,
  updateLastp3Scores
};
