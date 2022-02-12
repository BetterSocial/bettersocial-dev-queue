//const moment = require("moment");
const { getDb } = require("../config/mongodb_conn");
const {
  calcScoreOnCreateAccount,
  calcScoreOnCreatePost,
} = require("./scoring");

const initDataUserScore = (userId, timestamp) => {
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
    B_user_score: 0.0,
    u_user_score: 0.0,
    d_user_score: 0.0,
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
    last_upvotes: {
      counter: 0, // how many upvotes made by this user, in the last 7 days from "last_update"
      earliest_time: timestamp, // the earliest time of upvote when counting the upvotes
      last_time: timestamp, // the last time of upvote when counting the upvotes
      last_update: timestamp, // when is the last update time of this counter
    },
    last_downvotes: {
      counter: 0, // how many downvotes made by this user, in the last 7 days from "last_update"
      earliest_time: timestamp, // the earliest time of downvote when counting the downvotes
      last_time: timestamp, // the last time of downvote when counting the downvotes
      last_update: timestamp, // when is the last update time of this counter
    },
    last_blocks: {
      counter: 0, // how many blocks made by this user, in the last 7 days from "last_update"
      earliest_time: timestamp, // the earliest time of block when counting the blocks
      last_time: timestamp, // the last time of block when counting the blocks
      last_update: timestamp, // when is the last update time of this counter
    },
    last_posts: {
      counter: 0, // how many posts made by this user, in the last 7 days from "last_update"
      earliest_time: timestamp, // the earliest time of post when counting the posts
      last_time: timestamp, // the last time of post when counting the posts
      last_update: timestamp, // when is the last update time of this counter
    },
    following: [], // list of user ids this user follows
    created_at: timestamp,
    updated_at: timestamp,
  };
};

const initDataPostScore = (feedId, timestamp) => {
  return {
    _id: feedId,
    foreign_id: "",
    time: "",
    author_id: "",
    has_link: false,
    expiration_setting: "24",
    expired_at: "",
    rec_score: 1.0, // recency score, based on expiration setting and now
    att_score: 1.0, // post-attributes score
    count_weekly_posts: 0.0, // total posts by user A (author) within last 7 days before this post
    impr_score: 0.0,
    domain_score: 1.0,
    longC_score: 0.0,
    p_longC_score: 1.0,
    W_score: 0.0,
    D_bench_score: 0.0,
    D_score: 0.0,
    downvote_point: 0.0,
    upvote_point: 0.0,
    s_updown_score: 0.0,
    BP_score: 0.0,
    WS_updown_score: 0.0,
    WS_D_score: 0.0,
    WS_nonBP_score: 1.0,
    p_perf_score: 1.0,
    p2_score: 0.0,
    p3_score: 1.0,
    u_score: 1.0,
    post_score: 0.0,
    has_done_final_process: false,
    created_at: timestamp,
    updated_at: timestamp,
  };
};

/*
 * Job processor on create account event. Received data:
 *   - user_id : text, id of the created user
 *   - register_time : time, when the account has registered
 *   - emails : array of text, optiional (can be empty), email list of the user
 *   - twitter_acc : text, optional (can be empty), twitter id account of the user
 *   - topics : array of bigint, optional (can be empty), id topics that followed by the user
 *   - follow_users : array of text, optional (can be empty), user ids that followed by the user
 */
const onCreateAccount = async (data) => {
  console.debug("scoring onCreateAccount");
  let db = await getDb();
  let userScoreList = await db.collection('user_score');

  let userDoc = await userScoreList.findOne({"_id": data.user_id});
  console.debug("findOne userDoc result: " + JSON.stringify(userDoc));
  if (!userDoc) {
    console.debug("init user score doc");
    userDoc = initDataUserScore(data.user_id, data.register_time);
  }

  return await calcScoreOnCreateAccount(data, userDoc, userScoreList);
};

/*
 * Job processor on create post event. Received data:
 *   - feed_id: text, id of the created post/feed from getstream
 *   - foreign_id : text, id of the created post/feed from our system
 *   - time: text, post/feed creation time from getstream, in format "2014-11-11T14:06:30.494"
 *       (reference: https://getstream.io/activity-feeds/docs/node/adding_activities/?language=javascript)
 *   - user_id: text, id of the author of this post/feed
 *   - message: text, content of the post/feed
 *   - topics: array of text, optional (can be empty), list of topic tagged for this post/feed
 *   - privacy: text, privacy configuration of this post/feed.
 *   - anonimity: boolean, whether the post created as anonymous user
 *   - location_level: text, level of location targeted by the author
 *   - duration_feed: text, duration configuration of this post/feed
 *   - expired_at: text of datetime, optional (should be empty if duration is forever), when the post will be expired
 *   - images_url: array of text, optional (can be empty), list of media URLs (video/image) in this post/feed
 *   - poll_id: int, optional (could be not set), id of polling in the post
 */
const onCreatePost = async (data) => {
  console.debug("scoring onCreatePost");
  let db = await getDb();
  let userScoreList = await db.collection('user_score');

  const userScoreDoc = await userScoreList.findOne({"_id": data.user_id});
  console.debug("findOne userScoreDoc result: " + JSON.stringify(userScoreDoc));
  if (!userScoreDoc) {
    throw new Error("User data is not found, with id: " + data.user_id);
  }

  let postScoreList = await db.collection('post_score');
  let postScoreDoc = await postScoreList.findOne({"_id": data.feed_id});
  console.debug("findOne postScoreDoc result: " + JSON.stringify(postScoreDoc));
  if (!postScoreDoc) {
    console.debug("init post score doc");
    postScoreDoc = initDataPostScore(data.feed_id, data.created_at);
  }
  // put last post by user
  return await calcScoreOnCreatePost(data, postScoreDoc, postScoreList, userScoreDoc, userScoreList, db);
}

/*
 * Main function of scoring process job
 */
const scoringProcessJob = async (job, done) => {
  const {
    EVENT_CREATE_ACCOUNT,
    EVENT_CREATE_POST,
    EVENT_UPVOTE_POST,
    EVENT_CANCEL_UPVOTE_POST,
    EVENT_DOWNVOTE_POST,
    EVENT_CANCEL_DOWNVOTE_POST
  } = require("./scoring-constant");

  console.log("scoringProcessJob: " + JSON.stringify(job.data));
  try {
    console.info('running job scoring with id: ' + job.id);
    const messageData = job.data;
    switch(messageData.event) {
      case EVENT_CREATE_ACCOUNT:
        result = await onCreateAccount(messageData.data);
        break;
      case EVENT_CREATE_POST:
        result = await onCreatePost(messageData.data);
        break;
      case EVENT_CREATE_COMMENT:
//        result = onCreateComment(messageData.data);
        break;
      case EVENT_UPVOTE_POST:
        break;
      case EVENT_CANCEL_UPVOTE_POST:
        break;
      case EVENT_DOWNVOTE_POST:
        break;
      case EVENT_CANCEL_DOWNVOTE_POST:
        break;
      default:
        throw Error("Unknown event");
    }
    console.info(result);
    done(null, result);
  } catch (error) {
    console.log(error);
    done(null, error);
  }
}

module.exports = {
  scoringProcessJob
};
