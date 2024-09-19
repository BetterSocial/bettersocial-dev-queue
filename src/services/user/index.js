module.exports = {
  ...require('./adminBlockUser'),
  ...require('./adminUnblockUser'),
  ...require('./autoFollowUserAnon'),
  ...require('./setFollowerCount'),
  ...require('./setWPUUser')
};
