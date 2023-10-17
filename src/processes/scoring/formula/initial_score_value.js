const initDataUserScore = (userId, timestamp) => ({
  _id: userId,
  register_time: timestamp,
  F_score: 1.0,
  F_score_update: 1.0,
  sum_BP_score: 1.0,
  sum_BP_score_update: 1.0,
  sum_impr_score: 0.0,
  sum_impr_score_update: 0.0,
  r_score: 1.0,
  age_score: 0.0,
  q_score: 1.0,
  y_score: 1.0,
  u1_score: 1.0,
  user_score: 1.0,
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
  last_upvotes: {
    counter: 0, // how many upvotes made by this user, in the last 7 days from "last_update"
    earliest_time: "", // the earliest time of upvote when counting the upvotes
    last_time: "", // the last time of upvote when counting the upvotes
    last_update: timestamp, // when is the last update time of this counter
  },
  last_downvotes: {
    counter: 0, // how many downvotes made by this user, in the last 7 days from "last_update"
    earliest_time: "", // the earliest time of downvote when counting the downvotes
    last_time: "", // the last time of downvote when counting the downvotes
    last_update: timestamp, // when is the last update time of this counter
  },
  last_blocks: {
    counter: 0, // how many blocks made by this user, in the last 7 days from "last_update"
    earliest_time: "", // the earliest time of block when counting the blocks
    last_time: "", // the last time of block when counting the blocks
    last_update: timestamp, // when is the last update time of this counter
  },
  last_posts: {
    counter: 0, // how many posts made by this user, in the last 7 days from "last_update"
    earliest_time: "", // the earliest time of post when counting the posts
    last_time: "", // the last time of post when counting the posts
    last_update: timestamp, // when is the last update time of this counter
  },
  following: [], // list of user ids this user follows
  follower: [], // list of user ids that follows this user
  blocking: [],
  last_p3_scores: {
    // list of last p3 score along with the post information.
    _count: 0,
    // format of <key>:<value>
    // <post id> : { "time":"...", "p3_score": ... }
  },
  last_daily_process: "",
  created_at: timestamp,
  updated_at: timestamp,
});

const initDataPostScore = (feedId, timestamp) => ({
  _id: feedId,
  foreign_id: "",
  time: "",
  author_id: "",
  has_link: false,
  expiration_setting: "1",
  expired_at: "",
  topics: [],
  privacy: "",
  anonimity: false,
  rec_score: 1.0, // recency score, based on expiration setting and now
  att_score: 1.0, // post-attributes score
  count_weekly_posts: 0.0, // total posts by user A (author) within last 7 days before this post
  impr_score: 0.0,
  domain_score: 1.0,
  longC_score: 1.0,
  p_longC_score: 1.0,
  W_score: 0.0,
  D_bench_score: 0.0,
  D_score: 1.0,
  downvote_point: 0.0,
  upvote_point: 0.0,
  s_updown_score: 0.0,
  BP_score: 1.0,
  WS_updown_score: 0.0,
  WS_D_score: 0.0,
  WS_nonBP_score: 1.0,
  p_perf_score: 1.0,
  p2_score: 0.0,
  p3_score: 1.0,
  u_score: 1.0,
  post_score: 1.0,
  has_done_final_process: false,
  created_at: timestamp,
  updated_at: timestamp,
});

const initDataUserPostScore = (userId, feedId, timestamp) => ({
  _id: `${userId}:${feedId}`,
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
  last_updown: "",
  last_block: "",
  seen_count: 0,
  p_prev_score: 0.0,
  post_score: 0.0,
  user_post_score: 0.0,
  downvote_point: 0.0,
  upvote_point: 0.0,
  block_point: 0.0,
  activity_log: {},
  comment_log: {},
  impression_log: {},
  anomaly_activities: {
    upvote_time: "",
    cancel_upvote_time: "",
    downvote_time: "",
    cancel_downvote_time: "",
    block_time: "",
  },
  created_at: timestamp,
  updated_at: timestamp,
});

module.exports = {
  initDataUserScore,
  initDataPostScore,
  initDataUserPostScore
};
