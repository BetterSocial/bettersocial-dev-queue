// List of constant that used in formula
const USER_SCORE_WEIGHT = {
  W_Y: process.env.W_Y || 1, // weight of follower-quality y (part of user score u)
  W_F: process.env.W_F || 1, // Weight Follower-score f (part of user score u)
  W_B: process.env.W_B || 1, // weight of 'blocked p. impression' score b (part of user score u)
  W_R: process.env.W_R || 1, // weight of 'avg post score of last 10 posts' (part of user score u)
  W_Q: process.env.W_Q || 1, // weight of 'qualitative criteria' score (part of user score u)
  W_A: process.env.W_A || 1, // weight of account age score (part of user score u)
  W_EDU: process.env.W_EDU || 1.4, // Weight of User's confirmed .edu addresses
  W_EMAIL: process.env.W_EMAIL || 1.2, // Weight of User's confirmed work addresses
  W_TWITTER: process.env.W_TWITTER || 2, // Weight of: User has Twitter account connected & has more than 200 followers on Twitter
  W_USERATT: process.env.W_USERATT || 1,
  BP_IMPR_GLOBAL: process.env.BP_IMPR_GLOBAL || 0.00533333333333333 // Expected Blockpoints per Post Impression (posts from last 7d) - set manually based on real data
};

const POST_SCORE_P1_WEIGHT = {
  W_TOPIC: process.env.W_TOPIC || 2, // Weight for a post if the user follows one topic in the post
  W_FOLLOWS: process.env.W_FOLLOWS || 3, // Weight for a post if the user follows the post's author
  W_2DEGREE: process.env.W_2DEGRE || 1.5, // Weight for a post if the user follows a person who follows the post's author
  W_LINK_DOMAIN: process.env.W_LINKDOMAIN || 2.5, // Weight for a post if the post has a link preview AND the user follows the domain of that preview
  W_DOMAIN_POST: process.env.W_DOMAINPOST || 3, // Weight for a post posted by a domain page, if the user follows that domain
  W_DOMAIN_POST_2ND: process.env.W_DOMAINPOST2ND || 1.3 // Weight for a post posted by a domain page, if the user follows a person that follows that domain
};

const POST_SCORE_P2_WEIGHT = {
  W_REC: process.env.W_REC || 1, // Weight of recency score
  W_ATT: process.env.W_ATT || 1, // Weight of post attributes score
  W_D: process.env.W_D || 1, // Weight of domain score
  W_P: process.env.W_P || 1, // Weight of Post Count, which is the total posts of a user within last 7 days
  W_SIGN_P_REC: process.env.W_SIGNP_REC || 7, // Recommended maximum amount of weekly post per user, needs adjustment
  W_ANON: process.env.W_ANON || 0.8, // Weight of anonymous post setting
  W_HAS_TOPIC: process.env.W_HASTOPIC || 1.05, // Weight for posts that contains #topics
  W_HAS_MEDIA: process.env.W_HASMEDIA || 0.9, // Weight for posts that contains a picture or video
  W_HAS_POLL: process.env.W_HASPOLL || 1.8, // Weight for post that contains a poll
  W_HAS_LINK: process.env.W_HASLINK || 1.2, // Weight for post that contains a link preview
  W_SHORT: process.env.W_SHORT || 0.6, // Weight for post shorter than 80 characters
  W_LONG: process.env.W_LONG || 1.2, // Weight for post longer than 200 characters
  W_ZIP: process.env.W_ZIP || 2, // Weight for GEO - ZIP
  W_NHOOD: process.env.W_NHOOD || 2, // Weight for GEO - Neighborhood
  W_CITY: process.env.W_CITY || 1.6, // Weight for GEO - City
  W_STATE: process.env.W_STATE || 1.2, // Weight for GEO - State
  W_GLOBAL: process.env.W_GLOBAL || 0.8, // Weight for GEO - Country or Global
  W_PUBLIC: process.env.W_PUBLIC || 0.8, // Weight for Privacy setting = Public
  W_FOLLOWING: process.env.W_FOLLOWING || 1.3 // Weight for Privacy setting = Following (users the user is following)
};

const POST_SCORE_P3_WEIGHT = {
  Z_NON_BP: process.env.Z_NONBP || 0.1, // z-value for the (1-#BP) Distribution (>> “Confidence Intervall”)
  Z_UP_DOWN: process.env.Z_UPDOWN || 3.0, // z-value for the 'UpDown Score' Distribution  (>> “Confidence Intervall”)
  Z_D: process.env.Z_D || 0.9, // z-value for the #D Duration Distribution (>> “Confidence Intervall”)
  EV_NON_BP: process.env.EV_NONBP || 99.9, // Expected value (µ) of the (1-#BP) Distribution
  EV_UP_DOWN: process.env.EV_UPDOWN || 54.62, // Expected value (µ) of the  'UpDown Score' Distribution
  EV_D: process.env.EV_D || 30, // Expected value (µ) of the #D Duration Distribution
  WW_NON_BP: process.env.WW_NONBP || 45, // Weight(exponential) applied to nonBP "Wilson" score
  WW_UP_DOWN: process.env.WW_UPDOWN || 8, // Weight(exponential) applied to UpDown Score's "Wilson" score
  WW_D: process.env.WW_D || 1, // Weight(exponential) applied to #D's "Wilson" score  (Duration)
  W_DOWN: process.env.W_DOWN || -1.2, // Weight applied to Downvotes within the 'UPDOWN score'
  W_N: process.env.W_N || -0.05, // Weight applied to "Don't care" reactions (Impressions without Up or Downvote) within the 'UPDOWN score'
  DUR_MIN: process.env.DUR_MIN || 2500, // Minimum duration of post view to count as D - fix component
  DUR_MARG: process.env.DUR_MARG || 400, // Marginal additional duration of post view per word to count as D - variable component
  W_LONG_C: process.env.W_LONGC || 1 // Weight of p_longC score for long comments to post
};

const PREVIOUS_INTERACTION_WEIGHT = {
  PREV_D: process.env.PREV_D || 0.05, // Multiplier  if user has previously downvoted post
  PREV_UC: process.env.PREV_UC || 0.8, // Multiplier if User has previously upvoted or commented on the post
  PREV_PRE: process.env.PREV_PRE || 0.5 // Multiplier if the User has previously seen, but NOT up/downvoted or commented a post
};

const REACTION_WEIGHT = {
  SIGN_U_REC: process.env.SIGNU_REC || 50, // Expected/recommended number of upvotes per user in 7days
  SIGN_D_REC: process.env.SIGND_REC || 50, // Expected/recommended number of downvotes per user in 7days
  SIGN_B_REC: process.env.SIGNB_REC || 4 // Expected/recommended number of Blocks (of other users) per user in 7days
};

const FINAL_SCORE_WEIGHT = {
  W_U: process.env.W_U || 1, // weight of user score u
  W_P2: process.env.W_P2 || 1, // weight of postscore2 (stable factors)
  W_P1: process.env.W_P1 || 1, // weight of postscore1 (Core factors)
  W_P3: process.env.W_P3 || 1, // weight of postscore3 (containing p_perf & p_longC)
  W_PREV: process.env.W_PREV || 1 // weight of score for previous interactions of the user with this post
};

module.exports = {
  USER_SCORE_WEIGHT,
  POST_SCORE_P1_WEIGHT,
  POST_SCORE_P2_WEIGHT,
  POST_SCORE_P3_WEIGHT,
  PREVIOUS_INTERACTION_WEIGHT,
  REACTION_WEIGHT,
  FINAL_SCORE_WEIGHT
};
