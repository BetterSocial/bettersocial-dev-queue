//const moment = require("moment");
const { getDb } = require("../config/mongodb_conn");
const {
  DB_COLLECTION_USER_SCORE,
  DB_COLLECTION_POST_SCORE,
  DB_COLLECTION_USER_POST_SCORE
} = require("./scoring-constant");
const {
  calcScoreOnCreateAccount,
  calcScoreOnCreatePost,
  calcScoreOnUpvotePost,
  calcScoreOnCancelUpvotePost,
  calcScoreOnDownvotePost,
  calcScoreOnCancelDownvotePost,
  calcScoreOnBlockUserPost,
  calcScoreOnCommentPost,
  calcScoreOnViewPost,
  calcScoreOnFollowUser,
  calcScoreOnUnfollowUser,
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
    blocking: [],
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

const initDataUserPostScore = (userId, feedId, timestamp) => {
  return {
    _id: userId+":"+feedId,
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
  let userScoreList = await db.collection(DB_COLLECTION_USER_SCORE);

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
  let userScoreList = await db.collection(DB_COLLECTION_USER_SCORE);

  const userScoreDoc = await userScoreList.findOne({"_id": data.user_id});
  console.debug("findOne userScoreDoc result: " + JSON.stringify(userScoreDoc));
  if (!userScoreDoc) {
    throw new Error("User data is not found, with id: " + data.user_id);
  }

  let postScoreList = await db.collection(DB_COLLECTION_POST_SCORE);
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
 * Job processor on upvote post event. Received data:
 *   - user_id: text, id of the user who doing the upvote action
 *   - feed_id: text, id of the feed which being upvoted
 *   - activity_time: text, date and time when activity is done in format "YYYY-MM-DD HH:mm:ss"
 */
const onUpvotePost = async (data) => {
  console.debug("scoring onUpvotePost");
  let db = await getDb();
  let userScoreList = await db.collection(DB_COLLECTION_USER_SCORE);
  let postScoreList = await db.collection(DB_COLLECTION_POST_SCORE);
  let userPostScoreList = await db.collection(DB_COLLECTION_USER_POST_SCORE);

  const userScoreDoc = await userScoreList.findOne({"_id": data.user_id});
  console.debug("findOne userScoreDoc result: " + JSON.stringify(userScoreDoc));
  if (!userScoreDoc) {
    throw new Error("User data is not found, with id: " + data.user_id);
  }

  let postScoreDoc = await postScoreList.findOne({"_id": data.feed_id});
  console.debug("findOne postScoreDoc result: " + JSON.stringify(postScoreDoc));
  if (!postScoreDoc) {
    throw new Error("Post data is not found, with id: " + data.feed_id);
  }

  let userPostScoreDoc = await userPostScoreList.findOne({"_id": data.user_id+":"+data.feed_id});
  console.debug("findOne userPostScoreDoc result: " + JSON.stringify(userPostScoreDoc));
  if (!userPostScoreDoc) {
    console.debug("init user post score doc");
    userPostScoreDoc = initDataUserPostScore(data.user_id, data.feed_id, data.activity_time);
  }

  return await calcScoreOnUpvotePost(data, userScoreDoc, userScoreList, postScoreDoc, postScoreList, userPostScoreDoc, userPostScoreList);
};

/*
 * Job processor on cancel-upvote post event. Received data:
 *   - user_id: text, id of the user who doing the cancel-upvote action
 *   - feed_id: text, id of the feed which being cancel-upvoted
 *   - activity_time: text, date and time when activity is done in format "YYYY-MM-DD HH:mm:ss"
 */
const onCancelUpvotePost = async (data) => {
  console.debug("scoring onCancelUpvotePost");
  let db = await getDb();
  let userScoreList = await db.collection(DB_COLLECTION_USER_SCORE);
  let postScoreList = await db.collection(DB_COLLECTION_POST_SCORE);
  let userPostScoreList = await db.collection(DB_COLLECTION_USER_POST_SCORE);

  const userScoreDoc = await userScoreList.findOne({"_id": data.user_id});
  console.debug("findOne userScoreDoc result: " + JSON.stringify(userScoreDoc));
  if (!userScoreDoc) {
    throw new Error("User data is not found, with id: " + data.user_id);
  }

  let postScoreDoc = await postScoreList.findOne({"_id": data.feed_id});
  console.debug("findOne postScoreDoc result: " + JSON.stringify(postScoreDoc));
  if (!postScoreDoc) {
    throw new Error("Post data is not found, with id: " + data.feed_id);
  }

  let userPostScoreDoc = await userPostScoreList.findOne({"_id": data.user_id+":"+data.feed_id});
  console.debug("findOne userPostScoreDoc result: " + JSON.stringify(userPostScoreDoc));
  if (!userPostScoreDoc) {
    console.debug("init user post score doc");
    userPostScoreDoc = initDataUserPostScore(data.user_id, data.feed_id, data.activity_time);
  }

  return await calcScoreOnCancelUpvotePost(data, userScoreDoc, userScoreList, postScoreDoc, postScoreList, userPostScoreDoc, userPostScoreList);
};

/*
 * Job processor on downvote post event. Received data:
 *   - user_id: text, id of the user who doing the downvote action
 *   - feed_id: text, id of the feed which being downvoted
 *   - activity_time: text, date and time when activity is done in format "YYYY-MM-DD HH:mm:ss"
 */
const onDownvotePost = async (data) => {
  console.debug("scoring onDownvotePost");
  let db = await getDb();
  let userScoreList = await db.collection(DB_COLLECTION_USER_SCORE);
  let postScoreList = await db.collection(DB_COLLECTION_POST_SCORE);
  let userPostScoreList = await db.collection(DB_COLLECTION_USER_POST_SCORE);

  const userScoreDoc = await userScoreList.findOne({"_id": data.user_id});
  console.debug("findOne userScoreDoc result: " + JSON.stringify(userScoreDoc));
  if (!userScoreDoc) {
    throw new Error("User data is not found, with id: " + data.user_id);
  }

  let postScoreDoc = await postScoreList.findOne({"_id": data.feed_id});
  console.debug("findOne postScoreDoc result: " + JSON.stringify(postScoreDoc));
  if (!postScoreDoc) {
    throw new Error("Post data is not found, with id: " + data.feed_id);
  }

  let userPostScoreDoc = await userPostScoreList.findOne({"_id": data.user_id+":"+data.feed_id});
  console.debug("findOne userPostScoreDoc result: " + JSON.stringify(userPostScoreDoc));
  if (!userPostScoreDoc) {
    console.debug("init user post score doc");
    userPostScoreDoc = initDataUserPostScore(data.user_id, data.feed_id, data.activity_time);
  }

  return await calcScoreOnDownvotePost(data, userScoreDoc, userScoreList, postScoreDoc, postScoreList, userPostScoreDoc, userPostScoreList);
};

/*
 * Job processor on cancel-downvote post event. Received data:
 *   - user_id: text, id of the user who doing the cancel-downvote action
 *   - feed_id: text, id of the feed which being cancel-downvoted
 *   - activity_time: text, date and time when activity is done in format "YYYY-MM-DD HH:mm:ss"
 */
const onCancelDownvotePost = async (data) => {
  console.debug("scoring onCancelDownvotePost");
  let db = await getDb();
  let userScoreList = await db.collection(DB_COLLECTION_USER_SCORE);
  let postScoreList = await db.collection(DB_COLLECTION_POST_SCORE);
  let userPostScoreList = await db.collection(DB_COLLECTION_USER_POST_SCORE);

  const userScoreDoc = await userScoreList.findOne({"_id": data.user_id});
  console.debug("findOne userScoreDoc result: " + JSON.stringify(userScoreDoc));
  if (!userScoreDoc) {
    throw new Error("User data is not found, with id: " + data.user_id);
  }

  let postScoreDoc = await postScoreList.findOne({"_id": data.feed_id});
  console.debug("findOne postScoreDoc result: " + JSON.stringify(postScoreDoc));
  if (!postScoreDoc) {
    throw new Error("Post data is not found, with id: " + data.feed_id);
  }

  let userPostScoreDoc = await userPostScoreList.findOne({"_id": data.user_id+":"+data.feed_id});
  console.debug("findOne userPostScoreDoc result: " + JSON.stringify(userPostScoreDoc));
  if (!userPostScoreDoc) {
    console.debug("init user post score doc");
    userPostScoreDoc = initDataUserPostScore(data.user_id, data.feed_id, data.activity_time);
  }

  return await calcScoreOnCancelDownvotePost(data, userScoreDoc, userScoreList, postScoreDoc, postScoreList, userPostScoreDoc, userPostScoreList);
};

/*
 * Job processor on block user post event. Received data:
 *   - user_id: text, id of the user who doing the action
 *   - feed_id: text, optional, id of the feed which being blocked
 *   - blocked_user_id: text, optional, id of the user which being blocked
 *   - activity_time: text, date and time when activity is done in format "YYYY-MM-DD HH:mm:ss"
 */
const onBlockUserPost = async (data) => {
  console.debug("scoring onBlockUserPost");
  let db = await getDb();
  let userScoreList = await db.collection(DB_COLLECTION_USER_SCORE);
  let postScoreList = await db.collection(DB_COLLECTION_POST_SCORE);
  let userPostScoreList = await db.collection(DB_COLLECTION_USER_POST_SCORE);

  const userScoreDoc = await userScoreList.findOne({"_id": data.user_id});
  console.debug("findOne userScoreDoc result: " + JSON.stringify(userScoreDoc));
  if (!userScoreDoc) {
    throw new Error("User data is not found, with id: " + data.user_id);
  }

  let postScoreDoc;
  let authorUserScoreDoc;
  let userPostScoreDoc;
  if (data.feed_id) {
    postScoreDoc = await postScoreList.findOne({"_id": data.feed_id});
    console.debug("findOne postScoreDoc result: " + JSON.stringify(postScoreDoc));
    if (!postScoreDoc) {
      throw new Error("Post data is not found, with id: " + data.feed_id);
    }

    userPostScoreDoc = await userPostScoreList.findOne({"_id": data.user_id+":"+data.feed_id});
    console.debug("findOne userPostScoreDoc result: " + JSON.stringify(userPostScoreDoc));
    if (!userPostScoreDoc) {
      console.debug("init user post score doc");
      userPostScoreDoc = initDataUserPostScore(data.user_id, data.feed_id, data.activity_time);
      userPostScoreDoc.author_id = postScoreDoc.author_id;
    }

    // Get author user doc, if the blocked user id is given, but still we get the doc by using author id of the post, just to make sure it won't mistaken.
    authorUserScoreDoc = await userScoreList.findOne({"_id": postScoreDoc.author_id});
    console.debug("findOne userScoreDoc of author: " + JSON.stringify(authorUserScoreDoc));
    if (!authorUserScoreDoc) {
      throw new Error("Author User data is not found, with id: " + postScoreDoc.author_id);
    }
  } else {
    authorUserScoreDoc = await userScoreList.findOne({"_id": data.blocked_user_id});
    console.debug("findOne userScoreDoc of blocked user: " + JSON.stringify(authorUserScoreDoc));
    if (!authorUserScoreDoc) {
      throw new Error("Blocked User data is not found, with id: " + data.blocked_user_id);
    }
  }

  return await calcScoreOnBlockUserPost(data, userScoreDoc, authorUserScoreDoc, userScoreList, postScoreDoc, postScoreList, userPostScoreDoc, userPostScoreList);
};

/*
 * Job processor on comment post event. Received data:
 *   - comment_id : text, id of the created comment
 *   - feed_id : text, id of the post/feed which commented
 *   - user_id : text, user id who commented
 *   - message : text, content of the comment
 *   - activity_time : time, when the user comment the post/feed
 */
const onCommentPost = async (data) => {
  console.debug("scoring onCommentPost");
  let db = await getDb();
  let postScoreList = await db.collection(DB_COLLECTION_POST_SCORE);
  let userPostScoreList = await db.collection(DB_COLLECTION_USER_POST_SCORE);


  let postScoreDoc = await postScoreList.findOne({"_id": data.feed_id});
  console.debug("findOne postScoreDoc result: " + JSON.stringify(postScoreDoc));
  if (!postScoreDoc) {
    throw new Error("Post data is not found, with id: " + data.feed_id);
  }

  let userPostScoreDoc = await userPostScoreList.findOne({"_id": data.user_id+":"+data.feed_id});
  console.debug("findOne userPostScoreDoc result: " + JSON.stringify(userPostScoreDoc));
  if (!userPostScoreDoc) {
    console.debug("init user post score doc");
    userPostScoreDoc = initDataUserPostScore(data.user_id, data.feed_id, data.activity_time);
  }

  return await calcScoreOnCommentPost(data, postScoreDoc, postScoreList, userPostScoreDoc, userPostScoreList);
};

/*
 * Job processor on view post event. Received data:
 *   - feed_id : text, id of the post/feed which viewed
 *   - user_id : text, user id who viewing the post
 *   - view_duration : number in milliseconds, duration of user viewing the post. If the user clicked to show the post in PDP, than the duration is total duration from previous page and view it in PDP
 *   - is_pdp : boolean, whether it includes duration in PDP
 *   - activity_time : time, when the user comment the post/feed
 */
const onViewPost = async (data) => {
  console.debug("scoring onViewPost");
  let db = await getDb();
  let postScoreList = await db.collection(DB_COLLECTION_POST_SCORE);
  let userPostScoreList = await db.collection(DB_COLLECTION_USER_POST_SCORE);

  let postScoreDoc = await postScoreList.findOne({"_id": data.feed_id});
  console.debug("findOne postScoreDoc result: " + JSON.stringify(postScoreDoc));
  if (!postScoreDoc) {
    throw new Error("Post data is not found, with id: " + data.feed_id);
  }

  let userPostScoreDoc = await userPostScoreList.findOne({"_id": data.user_id+":"+data.feed_id});
  console.debug("findOne userPostScoreDoc result: " + JSON.stringify(userPostScoreDoc));
  if (!userPostScoreDoc) {
    console.debug("init user post score doc");
    userPostScoreDoc = initDataUserPostScore(data.user_id, data.feed_id, data.activity_time);
  }

  return await calcScoreOnViewPost(data, postScoreDoc, postScoreList, userPostScoreDoc, userPostScoreList);
};

/*
 * Job processor on follow user event. Received data:
 *   - user_id: text, id of the user who doing the action
 *   - followed_user_id: text, id of the user which being followed
 *   - activity_time: text, date and time when activity is done in format "YYYY-MM-DD HH:mm:ss"
 */
const onFollowUser = async (data) => {
  console.debug("scoring onFollowUser");
  let db = await getDb();
  let userScoreList = await db.collection(DB_COLLECTION_USER_SCORE);

  const userScoreDoc = await userScoreList.findOne({"_id": data.user_id});
  console.debug("findOne userScoreDoc result: " + JSON.stringify(userScoreDoc));
  if (!userScoreDoc) {
    throw new Error("User data is not found, with id: " + data.user_id);
  }

  return await calcScoreOnFollowUser(data, userScoreDoc, userScoreList);
};

/*
 * Job processor on unfollow user event. Received data:
 *   - user_id: text, id of the user who doing the action
 *   - followed_user_id: text, id of the user which being unfollowed
 *   - activity_time: text, date and time when activity is done in format "YYYY-MM-DD HH:mm:ss"
 */
const onUnfollowUser = async (data) => {
  console.debug("scoring onFollowUser");
  let db = await getDb();
  let userScoreList = await db.collection(DB_COLLECTION_USER_SCORE);

  const userScoreDoc = await userScoreList.findOne({"_id": data.user_id});
  console.debug("findOne userScoreDoc result: " + JSON.stringify(userScoreDoc));
  if (!userScoreDoc) {
    throw new Error("User data is not found, with id: " + data.user_id);
  }

  return await calcScoreOnUnfollowUser(data, userScoreDoc, userScoreList);
};

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
    EVENT_CANCEL_DOWNVOTE_POST,
    EVENT_BLOCK_USER_POST,
    EVENT_COMMENT_POST,
    EVENT_VIEW_POST,
    EVENT_FOLLOW_USER,
    EVENT_UNFOLLOW_USER,
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
      case EVENT_COMMENT_POST:
        result = await onCommentPost(messageData.data);
        break;
      case EVENT_UPVOTE_POST:
        result = await onUpvotePost(messageData.data);
        break;
      case EVENT_CANCEL_UPVOTE_POST:
        result = await onCancelUpvotePost(messageData.data);
        break;
      case EVENT_DOWNVOTE_POST:
        result = await onDownvotePost(messageData.data);
        break;
      case EVENT_CANCEL_DOWNVOTE_POST:
        result = await onCancelDownvotePost(messageData.data);
        break;
      case EVENT_BLOCK_USER_POST:
        result = await onBlockUserPost(messageData.data);
        break;
      case EVENT_VIEW_POST:
        result = await onViewPost(messageData.data);
        break;
      case EVENT_FOLLOW_USER:
        result = await onFollowUser(messageData.data);
        break;
      case EVENT_UNFOLLOW_USER:
        result = await onUnfollowUser(messageData.data);
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
