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
  w_topic: process.env.W_TOPIC || 2, // Weight for a post if the user follows one topic in the post
  w_follows: process.env.W_FOLLOWS || 3, // Weight for a post if the user follows the post's author
  w_2degree: process.env.W_2DEGRE || 1.5, // Weight for a post if the user follows a person who follows the post's author
  w_linkdomain: process.env.W_LINKDOMAIN || 2.5, // Weight for a post if the post has a link preview AND the user follows the domain of that preview
  w_domainpost: process.env.W_DOMAINPOST || 3, // Weight for a post posted by a domain page, if the user follows that domain
  w_domainpost2nd: process.env.W_DOMAINPOST2ND || 1.3, // Weight for a post posted by a domain page, if the user follows a person that follows that domain
};

const postScoreP2Constant = {
  w_rec: process.env.W_REC || 1, // Weight of recency score
  w_att: process.env.W_ATT || 1, // Weight of post attributes score
  w_d: process.env.W_D || 1, // Weight of domain score
  w_P: process.env.W_P || 1, // Weight of Post Count, which is the total posts of a user within last 7 days
  signP_rec: process.env.W_SIGNP_REC || 7, // Recommended maximum amount of weekly post per user, needs adjustment
  w_anon: process.env.W_ANON || 0.8, // Weight of anonymous post setting
  w_hastopic: process.env.W_HASTOPIC || 1.05, // Weight for posts that contains #topics
  w_hasmedia: process.env.W_HASMEDIA || 0.9, // Weight for posts that contains a picture or video
  w_haspoll: process.env.W_HASPOLL || 1.8, // Weight for post that contains a poll
  w_haslink: process.env.W_HASLINK || 1.2, // Weight for post that contains a link preview
  w_short: process.env.W_SHORT || 0.6, // Weight for post shorter than 80 characters
  w_long: process.env.W_LONG || 1.2, // Weight for post longer than 200 characters
  w_zip: process.env.W_ZIP || 2, // Weight for GEO - ZIP
  w_nhood: process.env.W_NHOOD || 2, // Weight for GEO - Neighborhood
  w_city: process.env.W_CITY || 1.6, // Weight for GEO - City
  w_state: process.env.W_STATE || 1.2, // Weight for GEO - State
  w_global: process.env.W_GLOBAL || 0.8, // Weight for GEO - Country or Global
  w_public: process.env.W_PUBLIC || 0.8, // Weight for Privacy setting = Public
  w_following: process.env.W_FOLLOWING || 1.3, // Weight for Privacy setting = Following (users the user is following)
};

const postScoreP3Constant = {
  z_nonBP: process.env.Z_NONBP || 0.1, // z-value for the (1-#BP) Distribution (>> “Confidence Intervall”)
  z_updown: process.env.Z_UPDOWN || 3.0, // z-value for the 'UpDown Score' Distribution  (>> “Confidence Intervall”)
  z_D: process.env.Z_D || 0.9, // z-value for the #D Duration Distribution (>> “Confidence Intervall”)
  EV_nonBP: process.env.EV_NONBP || 99.9, // Expected value (µ) of the (1-#BP) Distribution
  EV_updown: process.env.EV_UPDOWN || 54.62, // Expected value (µ) of the  'UpDown Score' Distribution
  EV_D: process.env.EV_D || 30, // Expected value (µ) of the #D Duration Distribution
  ww_nonBP: process.env.WW_NONBP || 45, // Weight(exponential) applied to nonBP "Wilson" score
  ww_updown: process.env.WW_UPDOWN || 8, // Weight(exponential) applied to UpDown Score's "Wilson" score
  ww_D: process.env.WW_D || 1, // Weight(exponential) applied to #D's "Wilson" score  (Duration)
  w_Down: process.env.W_DOWN || -1.2, // Weight applied to Downvotes within the 'UPDOWN score'
  w_n: process.env.W_N || -0.05, // Weight applied to "Don't care" reactions (Impressions without Up or Downvote) within the 'UPDOWN score'
  dur_min: process.env.DUR_MIN || 2500, // Minimum duration of post view to count as D - fix component
  dur_marg: process.env.DUR_MARG || 400, // Marginal additional duration of post view per word to count as D - variable component
  w_longC: process.env.W_LONGC || 1, // Weight of p_longC score for long comments to post
};

const prevInteractionConstant = {
  Prev_D: process.env.PREV_D || 0.05, // Multiplier  if user has previously downvoted post
  Prev_UC: process.env.PREV_UC || 0.8, // Multiplier if User has previously upvoted or commented on the post
  Prev_pre: process.env.PREV_PRE || 0.5, // Multiplier if the User has previously seen, but NOT up/downvoted or commented a post
};

const reactionConstant = {
  signu_rec: process.env.SIGNU_REC || 50, // Expected/recommended number of upvotes per user in 7days
  signd_rec: process.env.SIGND_REC || 50, // Expected/recommended number of downvotes per user in 7days
  signB_rec: process.env.SIGNB_REC || 4, // Expected/recommended number of Blocks (of other users) per user in 7days
};

const finalScoreConstant = {
  w_u: process.env.W_U || 1, // weight of user score u
  w_p2: process.env.W_P2 || 1, // weight of postscore2 (stable factors)
  w_p1: process.env.W_P1 || 1, // weight of postscore1 (Core factors)
  w_p3: process.env.W_P3 || 1, // weight of postscore3 (containing p_perf & p_longC)
  w_prev: process.env.W_PREV || 1, // weight of score for previous interactions of the user with this post
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
