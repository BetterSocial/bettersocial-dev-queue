const moment = require("moment");

const updateLastp3Scores = (userScoreDoc, postScoreDoc) => {
  const p3scoreSubDoc = userScoreDoc.last_p3_scores[postScoreDoc._id];
  if (p3scoreSubDoc) {
    p3scoreSubDoc.p3_score = postScoreDoc.p3_score;
  }

  return userScoreDoc;
}

const calcUserScore = async(userDoc) => {
  console.debug("Starting calcUserScore");

  /*
  return {
    _id: userId,
    register_time: timestamp,
    F_score: 0.0,
    sum_BP_score: 0.0,
    sum_impr_score: 0.0,
    r_score: 1.0,
    age_score: 0.0,
    q_score: 1.0,
    y_score: 0.0,
    u1_score: 0.0,
    user_score: 0.0,
    confirmed_acc: {
      edu_emails: [],
      non_private_email: [],
      twitter_acc: {
        acc_name: "",
        num_followers: 0,
      },
    },
    topics: [],
    user_att: "",
    user_att_score: 1.0,
    created_at: timestamp,
    updated_at: timestamp,
  };
  */
  const { userScore, followerScore, userScoreWithoutFollower, blockedPerPostImpression,
    blockpointsPerImpression, ageScore } = require('../../utils');
  require('dotenv').config;

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

  const ageAccountUser = Math.trunc(
    moment.duration(
      moment().utc().diff(
        moment.utc(userDoc.register_time, "YYYY-MM-DD HH:mm:ss", true)
      )
    ).as('days')
  );

  // Calculate variables not yet calculated for getting the user score
  const f = followerScore(userDoc.F_score);
  const BPpImpr_un = blockpointsPerImpression(userDoc.sum_BP_score, userDoc.sum_impr_score, bpImprGlobal);
  const b = blockedPerPostImpression(BPpImpr_un);
  const a = ageScore(ageAccountUser);
  const u1 = userScoreWithoutFollower(f, WF, b, WB, userDoc.r_score, WR, userDoc.q_score, WQ, a, WA);
  const user_score = userScore(u1, userDoc.y_score, WY);
  console.debug("Calculation result ageAccountUser=" + ageAccountUser + ", f=" + f + ", BPpImpr_un=" + BPpImpr_un + ", b=" + b + ", a=" + a + ", u1=" + u1);

  // Put the calculation result in the user doc
  userDoc.age_score = ageAccountUser;
  userDoc.u1_score = u1;
  userDoc.user_score = user_score;

  console.debug("calcUserScore: Final user doc: " + JSON.stringify(userDoc));
  return userDoc;
};

module.exports = {
  calcUserScore,
  updateLastp3Scores
}
