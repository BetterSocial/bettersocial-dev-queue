const express = require('express');
const {
  adminBlockUser,
  adminUnblockUser,
  autoFollowUserAnon,
  setAllFollowerCount
} = require('../services/user');

const auth = require('../middlewares/dev-auth');

const router = express.Router();

router.post('/admin-block-user', auth.dev, adminBlockUser);
router.post('/admin-unblock-user', auth.dev, adminUnblockUser);
router.post('/auto-follow-users-anon', auth.dev, autoFollowUserAnon);

if (process.env.SET_ALL_FOLLOWER_COUNT === 'true') {
  router.post('/set-all-follower-count', setAllFollowerCount);
}

module.exports = router;
