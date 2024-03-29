const express = require('express');
const {refreshPostViewTime} = require('../services');
const {
  syncFeedPerUser,
  unfollowFeed,
  getFeedFollowing,
  getFeedFollower,
  getFeedActivities,
  resetAndSyncFeed,
  getActivityById,
  removeActivityById,
  syncUserScore,
  activityScore,
  getWeightValue,
  lastP3Score,
  updatePostScoreGetstream,
  syncMainFeedBroadPerUser
} = require('../services');
const auth = require('../middlewares/dev-auth');

const router = express.Router();

router.get('/refresh-post-view-time', refreshPostViewTime);
// sync user feed
router.post('/sync-feed', syncFeedPerUser);
router.post('/sync-main-feed-broad', syncMainFeedBroadPerUser);

router.post('/unfollow-feed', unfollowFeed);
router.post('/feed-following', getFeedFollowing);
router.post('/feed-follower', getFeedFollower);
router.post('/feed-activities', getFeedActivities);
router.post('/reset-sync-feed', resetAndSyncFeed);

router.post('/get-activity-by-id', getActivityById);
router.post('/remove-activity-by-id', removeActivityById);
router.post('/sync-user-score', syncUserScore);

router.post('/check-activity-score', auth.dev, activityScore);
router.get('/get-weight-value', auth.dev, getWeightValue);
router.post('/update-last-p3', auth.dev, lastP3Score);
router.post('/update-post-score-getstream', auth.dev, updatePostScoreGetstream);

// sync all user feed
// router.get("/sync-feed", refreshPostViewTime);

module.exports = router;
