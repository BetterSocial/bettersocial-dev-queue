require("dotenv").config();
const moment = require("moment");
const { userScoreConstant } = require("./formula/constant");

const updateLastp3Scores = (userScoreDoc, postScoreDoc) => {
  const p3scoreSubDoc = userScoreDoc.last_p3_scores[postScoreDoc._id];
  if (p3scoreSubDoc) {
    p3scoreSubDoc.p3_score = postScoreDoc.p3_score;
  }

  return userScoreDoc;
};

const calcUserScore = async (userDoc) => {
  console.debug("Starting calcUserScore");
  // ASK: where is #EMAIL variable?

  /*
  return {
    _id: userId,
    register_time: timestamp,
    F_score: 1.0,
    sum_BP_score: 0.0,
    sum_impr_score: 0.0,
    r_score: 1.0,
    age_score: 0.0,
    q_score: 1.0,
    y_score: 1.0,
    u1_score: 1.0,
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
  const {
    userScore,
    followerScore,
    userScoreWithoutFollower,
    blockedPerPostImpression,
    blockpointsPerImpression,
    ageScore,
  } = require("../../utils");

  const ageAccountUser = Math.trunc(
    moment
      .duration(
        moment()
          .utc()
          .diff(moment.utc(userDoc.register_time, "YYYY-MM-DD HH:mm:ss", true))
      )
      .as("days")
  );

  // Calculate variables not yet calculated for getting the user score

  const f = followerScore(userDoc.F_score); // ASK: should check follower number from db and ask about the validity of the formula
  const BPpImpr_un = blockpointsPerImpression(
    userDoc.sum_BP_score,
    userDoc.sum_impr_score,
    userScoreConstant.BpImpr_Global
  );
  const b = blockedPerPostImpression(BPpImpr_un);
  const a = ageScore(ageAccountUser);
  const u1 = userScoreWithoutFollower(
    f,
    userScoreConstant.w_f,
    b,
    userScoreConstant.w_b,
    userDoc.r_score,
    userScoreConstant.w_r,
    userDoc.q_score,
    userScoreConstant.w_q,
    a,
    userScoreConstant.w_a
  );
  const user_score = userScore(u1, userDoc.y_score, userScoreConstant.w_y);
  console.debug(
    `Calculation result ageAccountUser=${ageAccountUser}, f=${f}, BPpImpr_un=${BPpImpr_un}, b=${b}, a=${a}, u1=${u1}`
  );

  // Put the calculation result in the user doc
  userDoc.age_score = ageAccountUser;
  userDoc.u1_score = u1;
  userDoc.user_score = user_score;

  console.debug(`calcUserScore: Final user doc: ${JSON.stringify(userDoc)}`);
  return userDoc;
};

module.exports = {
  calcUserScore,
  updateLastp3Scores,
};
