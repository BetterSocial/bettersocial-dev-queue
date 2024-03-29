module.exports = {
  EVENT_CREATE_ACCOUNT: 'create-account',
  EVENT_CREATE_POST: 'create-post',
  EVENT_UPVOTE_POST: 'upvote-post',
  EVENT_CANCEL_UPVOTE_POST: 'cancel-upvote-post',
  EVENT_DOWNVOTE_POST: 'downvote-post',
  EVENT_CANCEL_DOWNVOTE_POST: 'cancel-downvote-post',
  EVENT_BLOCK_USER_POST: 'block-user-post',
  EVENT_COMMENT_POST: 'comment-post',
  EVENT_VIEW_POST: 'view-post',
  EVENT_FOLLOW_USER: 'follow-user',
  EVENT_UNFOLLOW_USER: 'unfollow-user',
  EVENT_UNBLOCK_USER: 'unblock-user',

  EVENT_DAILY_PROCESS_TRIGGER: 'daily-process-trigger',
  EVENT_DAILY_PROCESS_USER_SCORE_PHASE1: 'daily-process-user-score-1',
  EVENT_DAILY_PROCESS_USER_SCORE_PHASE2: 'daily-process-user-score-2',
  EVENT_DAILY_PROCESS_POST_SCORE: 'daily-process-post-score',

  DB_COLLECTION_USER_SCORE: 'user_score',
  DB_COLLECTION_POST_SCORE: 'post_score',
  DB_COLLECTION_USER_POST_SCORE: 'user_post_score',

  PRIVACY_PUBLIC: 'public',

  POST_TIME_FORMAT: 'YYYY-MM-DDTHH:mm:ss.SSSSSS',
  REGULAR_TIME_FORMAT: 'YYYY-MM-DD HH:mm:ss'
};
