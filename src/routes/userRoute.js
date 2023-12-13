const express = require('express');
const {adminBlockUser, adminUnblockUser, autoFollowUserAnon} = require('../services/user');

const auth = require('../middlewares/dev-auth');

const router = express.Router();

router.post('/admin-block-user', auth.dev, adminBlockUser);
router.post('/admin-unblock-user', auth.dev, adminUnblockUser);
router.post('/auto-follow-users-anon', autoFollowUserAnon);

module.exports = router;
