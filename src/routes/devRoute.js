require('dotenv').config();
const express = require('express');
const auth = require('../middlewares/dev-auth');
const env = process.env.NODE_ENV || 'development';
const router = express.Router();
const {blockUser, unblockUser} = require('../services/devHandler');

// dev api to test logic on handling reactions
if (env !== 'production') {
  // const scoringProcessData = {
  //   user_id: req.userId,
  //   feed_id: req.body.postId,
  //   blocked_user_id: req.body.userId,
  //   activity_time: moment.utc().format('YYYY-MM-DD HH:mm:ss')
  // };
  router.post('/block-user', auth.dev, blockUser);
  // const scoringProcessData = {
  //   user_id: req.userId,
  //   feed_id: req.body.postId,
  //   unblocked_user_id: req.body.userId,
  //   activity_time: moment().utc().format('YYYY-MM-DD HH:mm:ss')
  // };
  router.post('/unblock-user', auth.dev, unblockUser);
}

module.exports = router;
