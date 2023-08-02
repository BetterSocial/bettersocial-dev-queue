const { findRelatedUserIds, findUnrelatedUserIds  } = require("../processes/helper/userIdsToProcess");
const {followMainFeedBroad, unFollowMainFeedBroad } = require("../services/followMainFeedBroad")

const updateMainFeedBroadProcessJob = async (job, done) => {
    try {
        let data = job.data;
        let { userId } = data;
        const relatedUserIds = await findRelatedUserIds(userId)
        const unrelatedUserIds = await findUnrelatedUserIds(userId)
        console.log("***** Start Process Feed Board *****")
        await followMainFeedBroad(userId, unrelatedUserIds)
        await unFollowMainFeedBroad(userId, relatedUserIds)
        done(null, result);
    } catch (error) {
        console.error(error);
        done(error);
    }
}

module.exports = {
  updateMainFeedBroadProcessJob
}
