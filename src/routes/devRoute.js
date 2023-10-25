require('dotenv').config();
const express = require('express');
const auth = require('../middlewares/dev-auth');
const {
  blockUser,
  unblockUser,
  upvotePost,
  downvotePost,
  cancelUpvotePost,
  cancelDownvotePost
} = require('../services/devHandler');

const env = process.env.NODE_ENV || 'development';
const router = express.Router();

// dev api to test logic on handling reactions
if (env !== 'production') {
  router.post('/block-user', auth.dev, blockUser);
  router.post('/unblock-user', auth.dev, unblockUser);
  router.post('/upvote-post', auth.dev, upvotePost);
  router.post('/cancel-upvote-post', auth.dev, cancelUpvotePost);
  router.post('/downvote-post', auth.dev, downvotePost);
  router.post('/cancel-downvote-post', auth.dev, cancelDownvotePost);
}

module.exports = router;
