module.exports = {
  ...require('./blockUser'),
  ...require('./unblockUser'),
  ...require('./upvotePost'),
  ...require('./cancelUpvotePost'),
  ...require('./downvotePost'),
  ...require('./cancelDownvotePost')
};
