const express = require('express');
const { refreshPostViewTime } = require("../services");
const { syncFeedPerUser } = require("../services");

const router = express.Router();

router.get("/refresh-post-view-time", refreshPostViewTime);
// sync user feed
router.get("/sync-feed/:userId", syncFeedPerUser);
// sync all user feed
// router.get("/sync-feed", refreshPostViewTime);

module.exports = router;
