require("dotenv").config();
const {
  applyMultipliesToTotalScore,
  previousInteractionScore,
} = require("../../utils");

const calcUserPostScore = async (userPostScoreDoc) => {
  console.debug("Starting calcUserPostScore");

  /*
    _id: userId+":"feedId,
    user_id: userId,
    feed_id: feedId,
    author_id: "",
    topics_followed: 0,
    author_follower: false,
    second_degree_follower: false,
    domain_follower: false,
    p1_score: 0.0,
    upvote_count: 0,
    comment_count: 0,
    downvote_count: 0,
    block_count: 0,
    seen_count: 0,
    p_prev_score: 0.0,
    post_score: 0.0,
    user_post_score: 0.0,
    activity_log: {},
    anomaly_activities: {
      upvote_time: "",
      cancel_upvote_time: "",
      downvote_time: "",
      cancel_downvote_time: "",
      block_time: "",
      unblock_time: "",
    },
    created_at: timestamp,
    updated_at: timestamp,
  */
  const PREVD = process.env.PREV_D || 0.05;
  const PREVUC = process.env.PREV_UC || 0.8;
  const PREVPRE = process.env.PREV_PRE || 0.5;
  const WTOPIC = process.env.W_TOPIC || 2;
  const WFOLLOWS = process.env.W_FOLLOWS || 3;
  const WDEGREE = process.env.W_DEGREE || 1.5;
  const WLINK_DOMAIN = process.env.W_LINK_DOMAIN || 2.5;
  const WP1 = process.env.W_P1 || 1;
  const WPREV = process.env.W_PREV || 1;

  // Put the calculation result in the user doc
  userPostScoreDoc.p1_score = applyMultipliesToTotalScore(
    WTOPIC,
    userPostScoreDoc.topics_followed,
    WFOLLOWS,
    WDEGREE,
    WLINK_DOMAIN,
    userPostScoreDoc.author_follower,
    userPostScoreDoc.second_degree_follower,
    userPostScoreDoc.domain_follower
  );

  let prevInteract = "";
  if (userPostScoreDoc.downvote_count > 0) prevInteract = "downvote";
  else if (userPostScoreDoc.upvote_count > 0) prevInteract = "upvote";
  else if (userPostScoreDoc.comment_count > 0) prevInteract = "comment";
  else if (userPostScoreDoc.seen_count > 0) prevInteract = "seen";

  userPostScoreDoc.p_prev_score = previousInteractionScore(
    prevInteract,
    PREVD,
    PREVUC,
    PREVPRE
  );
  userPostScoreDoc.user_post_score =
    userPostScoreDoc.post_score *
    userPostScoreDoc.p1_score ** WP1 *
    userPostScoreDoc.p_prev_score ** WPREV;

  console.debug(
    `calcUserPostScore: Final user post score doc: ${JSON.stringify(
      userPostScoreDoc
    )}`
  );
  return userPostScoreDoc;
};

module.exports = {
  calcUserPostScore,
};
