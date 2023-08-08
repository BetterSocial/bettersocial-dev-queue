const {syncFeedPerUserProcess } = require("../services/syncFeedPerUser")

const syncUserFeedProcessJob = async (job, done) => {
    try {
        let data = job.data;
        let { userId } = data;
        await syncFeedPerUserProcess(userId)
        done(null, "ok");
    } catch (error) {
        console.error(error);
        done(error);
    }
}

module.exports = {
  syncUserFeedProcessJob
}
