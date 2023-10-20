require('dotenv').config();
const express = require('express');
const auth = require('../middlewares/dev-auth');
const env = process.env.NODE_ENV || 'development';
const router = express.Router();
const {blockUser, unblockUser} = require('../services/devHandler');

// dev api to test logic on handling reactions
if (env !== 'production') {
  router.post('/block-user', auth.dev, blockUser);
  router.post('/unblock-user', auth.dev, unblockUser);
}

module.exports = router;
