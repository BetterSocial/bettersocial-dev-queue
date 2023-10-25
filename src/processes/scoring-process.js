const {getDb} = require('../config/mongodb_conn');
const {
  DB_COLLECTION_USER_SCORE,
  DB_COLLECTION_POST_SCORE,
  DB_COLLECTION_USER_POST_SCORE,
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
  EVENT_UNBLOCK_USER
} = require('./scoring-constant');
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
  calcScoreOnUnblockUser
} = require('./scoring');

const {
  setInitialDataUserScore
} = require('../processes/scoring/formula/set-initial-data-user-score');
const {
  initDataUserScore,
  initDataPostScore,
  initDataUserPostScore
} = require('./scoring/formula/initial-score-value');

const getListData = async () => {
  const db = await getDb();
  const [userScoreList, postScoreList, userPostScoreList] = await Promise.all([
    db.collection(DB_COLLECTION_USER_SCORE),
    db.collection(DB_COLLECTION_POST_SCORE),
    db.collection(DB_COLLECTION_USER_POST_SCORE)
  ]);

  return {
    userScoreList,
    postScoreList,
    userPostScoreList
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
  console.debug(`scoring onCreateAccount: ${JSON.stringify(data)}`);
  const {userScoreList} = await getListData();

  let userDoc = await userScoreList.findOne({_id: data.user_id});
  console.debug(`findOne userDoc result: ${JSON.stringify(userDoc)}`);
  if (!userDoc) {
    console.debug('init user score doc');
    userDoc = initDataUserScore(data.user_id, data.register_time);
  }
  const result = await calcScoreOnCreateAccount(data, userDoc, userScoreList);
  return result;
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
  const db = await getDb();
  console.debug(`scoring onCreatePost: ${JSON.stringify(data)}`);
  const {postScoreList, userScoreList} = await getListData();

  let userScoreDoc = await userScoreList.findOne({_id: data.user_id});
  console.debug(`findOne userScoreDoc result: ${JSON.stringify(userScoreDoc)}`);
  if (!userScoreDoc) {
    userScoreDoc = await setInitialDataUserScore(data.user_id);
  }

  let postScoreDoc = await postScoreList.findOne({_id: data.feed_id});
  console.debug(`findOne postScoreDoc result: ${JSON.stringify(postScoreDoc)}`);
  if (!postScoreDoc) {
    console.debug('init post score doc');
    postScoreDoc = initDataPostScore(data.feed_id, data.created_at);
  }

  // put last post by user
  const result = await calcScoreOnCreatePost(
    data,
    postScoreDoc,
    postScoreList,
    userScoreDoc,
    userScoreList,
    db
  );
  return result;
};

/**
 * @typedef Followed
 * @property {string} id
 */
/**
 *
 * @param {*} data
 * @param {boolean} getUserScoreDoc
 * @param {boolean} getPostScoreDoc
 * @param {boolean} getAuthorUserScoreDoc
 * @param {boolean} getUserPostScoreDoc
 * @param {Followed} getFollowedUserScoreDoc
 * @returns
 */
const getDataToCalcScore = async (
  data,
  getUserScoreDoc = true,
  getPostScoreDoc = true,
  getAuthorUserScoreDoc = true,
  getUserPostScoreDoc = true,
  getFollowedUserScoreDoc = {}
) => {
  const {postScoreList, userPostScoreList, userScoreList} = await getListData();
  let userScoreDoc;
  let postScoreDoc;
  let authorUserScoreDoc;
  let userPostScoreDoc;
  let followedUserScoreDoc;

  if (getFollowedUserScoreDoc.id) {
    followedUserScoreDoc = await userScoreList.findOne({
      _id: getFollowedUserScoreDoc.id
    });
    console.debug(`findOne userScoreDoc result: ${JSON.stringify(followedUserScoreDoc)}`);
    if (!followedUserScoreDoc) {
      followedUserScoreDoc = await setInitialDataUserScore(getFollowedUserScoreDoc.id);
    }
  }
  if (getUserScoreDoc) {
    userScoreDoc = await userScoreList.findOne({_id: data.user_id});
    console.debug(`findOne userScoreDoc result: ${JSON.stringify(userScoreDoc)}`);
    if (!userScoreDoc) {
      userScoreDoc = await setInitialDataUserScore(data.user_id);
    }
  }
  if (getPostScoreDoc) {
    postScoreDoc = await postScoreList.findOne({_id: data.feed_id});
    console.debug(`findOne postScoreDoc result: ${JSON.stringify(postScoreDoc)}`);
    if (!postScoreDoc) {
      throw new Error(`Post data is not found, with id: ${data.feed_id}`);
    }
  }
  if (getAuthorUserScoreDoc) {
    authorUserScoreDoc = await userScoreList.findOne({
      _id: postScoreDoc.author_id
    });
    console.debug(`findOne author's userScoreDoc result: ${JSON.stringify(authorUserScoreDoc)}`);
    if (!authorUserScoreDoc) {
      authorUserScoreDoc = await setInitialDataUserScore(postScoreDoc.author_id);
    }
  }
  if (getUserPostScoreDoc) {
    userPostScoreDoc = await userPostScoreList.findOne({
      _id: `${data.user_id}:${data.feed_id}`
    });
    console.debug(`findOne userPostScoreDoc result: ${JSON.stringify(userPostScoreDoc)}`);
    if (!userPostScoreDoc) {
      console.debug('init user post score doc');
      userPostScoreDoc = initDataUserPostScore(data.user_id, data.feed_id, data.activity_time);
    }
  }
  return {
    userScoreDoc,
    userScoreList,
    postScoreDoc,
    postScoreList,
    userPostScoreDoc,
    userPostScoreList,
    authorUserScoreDoc,
    followedUserScoreDoc
  };
};

/*
 * Job processor on upvote post event. Received data:
 *   - user_id: text, id of the user who doing the upvote action
 *   - feed_id: text, id of the feed which being upvoted
 *   - activity_time: text, date and time when activity is done in format "YYYY-MM-DD HH:mm:ss"
 */
const onUpvotePost = async (data) => {
  console.debug(`scoring onUpvotePost: ${JSON.stringify(data)}`);
  const score = await getDataToCalcScore(data);
  const result = await calcScoreOnUpvotePost(data, score);
  return result;
};

/*
 * Job processor on cancel-upvote post event. Received data:
 *   - user_id: text, id of the user who doing the cancel-upvote action
 *   - feed_id: text, id of the feed which being cancel-upvoted
 *   - activity_time: text, date and time when activity is done in format "YYYY-MM-DD HH:mm:ss"
 */
const onCancelUpvotePost = async (data) => {
  console.debug(`scoring onCancelUpvotePost: ${JSON.stringify(data)}`);
  const score = await getDataToCalcScore(data);

  const result = await calcScoreOnCancelUpvotePost(data, score);
  return result;
};

/*
 * Job processor on downvote post event. Received data:
 *   - user_id: text, id of the user who doing the downvote action
 *   - feed_id: text, id of the feed which being downvoted
 *   - activity_time: text, date and time when activity is done in format "YYYY-MM-DD HH:mm:ss"
 */
const onDownvotePost = async (data) => {
  console.debug(`scoring onDownvotePost: ${JSON.stringify(data)}`);
  const score = await getDataToCalcScore(data);

  const result = await calcScoreOnDownvotePost(data, score);
  return result;
};

/*
 * Job processor on cancel-downvote post event. Received data:
 *   - user_id: text, id of the user who doing the cancel-downvote action
 *   - feed_id: text, id of the feed which being cancel-downvoted
 *   - activity_time: text, date and time when activity is done in format "YYYY-MM-DD HH:mm:ss"
 */
const onCancelDownvotePost = async (data) => {
  console.debug(`scoring onCancelDownvotePost: ${JSON.stringify(data)}`);
  const score = await getDataToCalcScore(data);

  const result = await calcScoreOnCancelDownvotePost(data, score);
  return result;
};

/*
 * Job processor on block user post event. Received data:
 *   - user_id: text, id of the user who doing the action
 *   - feed_id: text, optional, id of the feed which being blocked
 *   - blocked_user_id: text, optional, id of the user which being blocked
 *   - activity_time: text, date and time when activity is done in format "YYYY-MM-DD HH:mm:ss"
 */
const onBlockUserPost = async (data) => {
  console.debug(`scoring onBlockUserPost: ${JSON.stringify(data)}`);
  const {userScoreDoc, userScoreList, postScoreList, userPostScoreList} = await getDataToCalcScore(
    data,
    true,
    false,
    false,
    false
  );

  let postScoreDoc;
  let authorUserScoreDoc;
  let userPostScoreDoc;
  if (data.feed_id) {
    postScoreDoc = await postScoreList.findOne({_id: data.feed_id});
    console.debug(`findOne postScoreDoc result: ${JSON.stringify(postScoreDoc)}`);
    if (!postScoreDoc) {
      throw new Error(`Post data is not found, with id: ${data.feed_id}`);
    }

    userPostScoreDoc = await userPostScoreList.findOne({
      _id: `${data.user_id}:${data.feed_id}`
    });
    console.debug(`findOne userPostScoreDoc result: ${JSON.stringify(userPostScoreDoc)}`);
    if (!userPostScoreDoc) {
      console.debug('init user post score doc');
      userPostScoreDoc = initDataUserPostScore(data.user_id, data.feed_id, data.activity_time);
      userPostScoreDoc.author_id = postScoreDoc.author_id;
    }

    // Get author user doc, if the blocked user id is given, but still we get the doc by using author id of the post, just to make sure it won't mistaken.
    authorUserScoreDoc = await userScoreList.findOne({
      _id: postScoreDoc.author_id
    });
    console.debug(`findOne userScoreDoc of author: ${JSON.stringify(authorUserScoreDoc)}`);
    if (!authorUserScoreDoc) {
      authorUserScoreDoc = await setInitialDataUserScore(postScoreDoc.author_id);
    }
  } else {
    authorUserScoreDoc = await userScoreList.findOne({
      _id: data.blocked_user_id
    });
    console.debug(`findOne userScoreDoc of blocked user: ${JSON.stringify(authorUserScoreDoc)}`);
    if (!authorUserScoreDoc) {
      authorUserScoreDoc = await setInitialDataUserScore(data.blocked_user_id);
    }
  }
  const connectionList = {
    userScoreList,
    postScoreList,
    userPostScoreList
  };
  const result = await calcScoreOnBlockUserPost(
    data,
    userScoreDoc,
    authorUserScoreDoc,
    postScoreDoc,
    userPostScoreDoc,
    connectionList
  );
  return result;
};

/*
 * Job processor on unblock user event. Received data:
 *   - user_id: text, id of the user who doing the action
 *   - blocked_user_id: text, optional, id of the user which being blocked
 *   - activity_time: text, date and time when activity is done in format "YYYY-MM-DD HH:mm:ss"
 */
const onUnblockUser = async (data) => {
  console.debug(`scoring onUnblockUser: ${JSON.stringify(data)}`);
  const {userScoreDoc, userScoreList} = await getDataToCalcScore(data, true, false, false, false);

  let authorUserScoreDoc;

  authorUserScoreDoc = await userScoreList.findOne({
    _id: data.unblocked_user_id
  });
  console.debug(`findOne userScoreDoc of unblocked user: ${JSON.stringify(authorUserScoreDoc)}`);
  if (!authorUserScoreDoc) {
    authorUserScoreDoc = await setInitialDataUserScore(data.unblocked_user_id);
  }

  const connectionList = {
    userScoreList
  };

  const result = await calcScoreOnUnblockUser(
    data,
    userScoreDoc,
    authorUserScoreDoc,
    connectionList
  );
  return result;
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
  console.debug(`scoring onCommentPost: ${JSON.stringify(data)}`);
  const {
    postScoreDoc,
    postScoreList,
    userPostScoreDoc,
    userPostScoreList,
    authorUserScoreDoc,
    userScoreList
  } = await getDataToCalcScore(data, false);

  const result = await calcScoreOnCommentPost(
    data,
    postScoreDoc,
    postScoreList,
    userPostScoreDoc,
    userPostScoreList,
    authorUserScoreDoc,
    userScoreList
  );
  return result;
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
  console.debug(`scoring onViewPost: ${JSON.stringify(data)}`);
  const {
    postScoreDoc,
    postScoreList,
    userPostScoreDoc,
    userPostScoreList,
    authorUserScoreDoc,
    userScoreList
  } = await getDataToCalcScore(data, false);

  const result = await calcScoreOnViewPost(
    data,
    postScoreDoc,
    postScoreList,
    userPostScoreDoc,
    userPostScoreList,
    authorUserScoreDoc,
    userScoreList
  );
  return result;
};

/*
 * Job processor on follow user event. Received data:
 *   - user_id: text, id of the user who doing the action
 *   - followed_user_id: text, id of the user which being followed
 *   - activity_time: text, date and time when activity is done in format "YYYY-MM-DD HH:mm:ss"
 */
const onFollowUser = async (data) => {
  console.debug(`scoring onFollowUser: ${JSON.stringify(data)}`);
  const {userScoreDoc, userScoreList, followedUserScoreDoc} = await getDataToCalcScore(
    data,
    true,
    false,
    false,
    false,
    {
      id: data.followed_user_id
    }
  );

  const result = await calcScoreOnFollowUser(
    data,
    userScoreDoc,
    followedUserScoreDoc,
    userScoreList
  );
  return result;
};

/*
 * Job processor on unfollow user event. Received data:
 *   - user_id: text, id of the user who doing the action
 *   - unfollowed_user_id: text, id of the user which being unfollowed
 *   - activity_time: text, date and time when activity is done in format "YYYY-MM-DD HH:mm:ss"
 */
const onUnfollowUser = async (data) => {
  console.debug(`scoring onUnfollowUser: ${JSON.stringify(data)}`);
  const {userScoreDoc, userScoreList, followedUserScoreDoc} = await getDataToCalcScore(
    data,
    true,
    false,
    false,
    false,
    {
      id: data.unfollowed_user_id
    }
  );

  const result = await calcScoreOnUnfollowUser(
    data,
    userScoreDoc,
    followedUserScoreDoc,
    userScoreList
  );
  return result;
};

/*
 * Main function of scoring process job
 */
const scoringProcessJob = async (job, done) => {
  // console.log("scoringProcessJob: " + JSON.stringify(job.data));
  try {
    // console.info('running job scoring with id: ' + job.id);
    let result = null;
    const messageData = job.data;
    switch (messageData.event) {
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
      case EVENT_UNBLOCK_USER:
        result = await onUnblockUser(messageData.data);
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
        throw Error('Unknown event');
    }
    // console.info(result);
    done(null, result);
  } catch (error) {
    console.error(error);
    done(error);
  }
};

module.exports = {
  scoringProcessJob,
  onBlockUserPost,
  onUnblockUser,
  onUpvotePost,
  onCancelUpvotePost,
  onDownvotePost,
  onCancelDownvotePost
};
