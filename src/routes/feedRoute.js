const express = require('express');
const { refreshPostViewTime } = require("../services");
const { syncFeedPerUser, unfollowFeed, getFeedFollowing, getFeedFollower, getFeedActivities, resetAndSyncFeed} = require("../services");

const router = express.Router();

router.get("/refresh-post-view-time", refreshPostViewTime);
// sync user feed
router.get("/sync-feed/:userId", syncFeedPerUser);
router.post("/unfollow-feed", unfollowFeed);
router.post("/feed-following", getFeedFollowing);
router.post("/feed-follower", getFeedFollower);
router.post("/feed-activities", getFeedActivities);
router.post("/reset-sync-feed", resetAndSyncFeed);


// sync all user feed
// router.get("/sync-feed", refreshPostViewTime);

module.exports = router;
