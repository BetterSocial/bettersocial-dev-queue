const express = require('express');
const {adminBlockUser, adminUnblockUser} = require('../services/user');

const auth = require('../middlewares/dev-auth');

const router = express.Router();

router.post('/admin-block-user', auth.dev, adminBlockUser);
router.post('/admin-unblock-user', auth.dev, adminUnblockUser);

module.exports = router;
