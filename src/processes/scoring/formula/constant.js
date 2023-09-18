// List of constant that used in formula
const userScoreConstant = {
  w_y: process.env.W_Y || 1, // weight of follower-quality y (part of user score u)
  w_f: process.env.W_F || 1, // Weight Follower-score f (part of user score u)
  w_b: process.env.W_B || 1, // weight of 'blocked p. impression' score b (part of user score u)
  w_r: process.env.W_R || 1, // weight of 'avg post score of last 10 posts' (part of user score u)
  w_q: process.env.W_Q || 1, // weight of 'qualitative criteria' score (part of user score u)
  w_a: process.env.W_A || 1, // weight of account age score (part of user score u)
  w_edu: process.env.W_EDU || 1.4, // Weight of User's confirmed .edu addresses
  w_email: process.env.W_EMAIL || 1.2, // Weight of User's confirmed work addresses
  w_twitter: process.env.W_TWITTER || 2, // Weight of: User has Twitter account connected & has more than 200 followers on Twitter
  w_useratt: process.env.W_USERATT || 1,
  BpImpr_Global: process.env.BP_IMPR_GLOBAL || 0.00533333333333333, // Expected Blockpoints per Post Impression (posts from last 7d) - set manually based on real data
};

const postScoreP1Constant = {
  w_topic: process.env.W_TOPIC || 2,
  w_follows: process.env.W_FOLLOWS || 3,
  w_2degree: process.env.W_2DEGRE || 1.5,
  w_linkdomain: process.env.W_LINKDOMAIN || 2.5,
  w_domainpost: process.env.W_DOMAINPOST || 3,
  w_domainpost2nd: process.env.W_DOMAINPOST2ND || 1.3,
};

const postScoreP2Constant = {
  w_rec: process.env.W_REC || 1,
  w_att: process.env.W_ATT || 1,
  w_d: process.env.W_D || 1,
  w_P: process.env.W_P || 1,
  signP_rec: process.env.W_SIGNP_REC || 7,
  w_anon: process.env.W_ANON || 0.8,
  w_hastopic: process.env.W_HASTOPIC || 1.05,
  w_hasmedia: process.env.W_HASMEDIA || 0.9,
  w_haspoll: process.env.W_HASPOLL || 1.8,
  w_haslink: process.env.W_HASLINK || 1.2,
  w_short: process.env.W_SHORT || 0.6,
  w_long: process.env.W_LONG || 1.2,
  w_zip: process.env.W_ZIP || 2,
  w_nhood: process.env.W_NHOOD || 2,
  w_city: process.env.W_CITY || 1.6,
  w_state: process.env.W_STATE || 1.2,
  w_global: process.env.W_GLOBAL || 0.8,
  w_public: process.env.W_PUBLIC || 0.8,
  w_following: process.env.W_FOLLOWING || 1.3,
};

const postScoreP3Constant = {
  D_bench: process.env.D_BENCH || 1,
  z_nonBP: process.env.Z_NONBP || 0.1,
  z_updown: process.env.Z_UPDOWN || 3.0,
  z_D: process.env.Z_D || 0.9,
  EV_nonBP: process.env.EV_NONBP || 99.9,
  EV_updown: process.env.EV_UPDOWN || 54.62,
  EV_D: process.env.EV_D || 30,
  ww_nonBP: process.env.WW_NONBP || 45,
  ww_updown: process.env.WW_UPDOWN || 8,
  ww_D: process.env.WW_D || 1,
  w_Down: process.env.W_DOWN || -1.2,
  w_n: process.env.W_N || -0.05,
  dur_min: process.env.DUR_MIN || 2500,
  dur_marg: process.env.DUR_MARG || 400,
  w_longC: process.env.W_LONGC || 1,
};

const prevInteractionConstant = {
  Prev_D: process.env.W_LONGC || 0.05,
  Prev_UC: process.env.W_LONGC || 0.8,
  Prev_pre: process.env.W_LONGC || 0.5,
};

const reactionConstant = {
  signu_rec: process.env.SIGNU_REC || 50,
  signd_rec: process.env.SIGND_REC || 50,
  signB_rec: process.env.SIGNB_REC || 4,
};

const finalScoreConstant = {
  w_u: process.env.W_U || 1,
  w_p2: process.env.W_P2 || 1,
  w_p1: process.env.W_P1 || 1,
  w_p3: process.env.W_P3 || 1,
  w_prev: process.env.W_PREV || 1,
};

module.exports = {
  userScoreConstant,
  postScoreP1Constant,
  postScoreP2Constant,
  postScoreP3Constant,
  prevInteractionConstant,
  reactionConstant,
  finalScoreConstant,
};
