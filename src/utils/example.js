const test = async() => {
  const {
    finalScorePost, previousInteractionScore, applyMultipliesToTotalScore,
    scoreBasedPostCharacteristics, RecencyScore, ageOfPost
  } = require('./formula');
  const topicLength = [].length; //ambil dari getstream post jumlah topics
  const durationFeed = [].length; //ambil dari getstream duration_feed
  const now = new Date().toISOString();
  const WU = process.env.W_U || 1;
  const WP1 = process.env.W_P1 || 1;
  const WP2 = process.env.W_P2 || 1;
  const WP3 = process.env.W_P3 || 1;
  const WPREV = process.env.W_PREV || 1;
  const WATT = process.env.W_ATT || 1;
  const WREC = process.env.W_REC || 1;
  const PREVD = process.env.PREV_D || 0.05;
  const PREVUC = process.env.PREV_UC || 0.8;
  const PREVPRE = process.env.PREV_PRE || 0.5;
  const WTOPIC = process.env.W_TOPIC || 2;
  const WFOLLOWS = process.env.W_FOLLOWS || 3;
  const WDEGREE = process.env.W_DEGREE || 1.5;
  const WLINK_DOMAIN = process.env.W_LINK_DOMAIN || 2.5;
  const D = process.env.D || 1;
  const WD = process.env.W_D || 1;
  const WP = process.env.W_P || 1;
  const postScore = "PostCountScore"
  const agePost = ageOfPost(durationFeed, now, now);
  const rec = RecencyScore(agePost, durationFeed);
  const prev = previousInteractionScore('seen', PREVD, PREVUC, PREVPRE);
  const p1 = applyMultipliesToTotalScore(WTOPIC, topicLength, WFOLLOWS, WDEGREE, WLINK_DOMAIN, 1, "", 1);
  const p2 = scoreBasedPostCharacteristics(rec, WREC, att="", WATT, D, WD, postScore, WP, postLink);
  const finalScore = finalScorePost(userScore, WU, p1, WP1, p2, WP2, p3, WP3, prev, WPREV)

}
