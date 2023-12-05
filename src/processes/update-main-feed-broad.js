const {
  findRelatedUserIds,
  findUnrelatedUserIds,
  findUnrelatedAnonUserIds
} = require('./helper/userIdsToProcess');
const {followMainFeedBroad, unFollowMainFeedBroad} = require('../services/followMainFeedBroad');

const updateMainFeedBroadProcessJob = async (job, done) => {
  try {
    const data = job.data;
    const {userId} = data;
    const relatedUserIds = await findRelatedUserIds(userId);
    const unrelatedUserIds = await findUnrelatedUserIds(userId);
    const unrelatedAnonUserIds = await findUnrelatedAnonUserIds(userId);
    console.log('***** Start Process Feed Board *****');
    await followMainFeedBroad(userId, unrelatedUserIds);
    await followMainFeedBroad(userId, unrelatedAnonUserIds, true);
    await unFollowMainFeedBroad(userId, relatedUserIds);
    done(null, null);
  } catch (error) {
    console.error(error);
    done(error);
  }
};

module.exports = {
  updateMainFeedBroadProcessJob
};
