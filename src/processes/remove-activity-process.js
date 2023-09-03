const { removeActivityProcess } = require("../services/getStreamActivities")

const removeActivityProcessJob = async (job, done) => {
    try {
        let data = job.data;
        let { activity_id } = data;
        await removeActivityProcess(activity_id)
        done(null, "ok");
    } catch (error) {
        console.error(error);
        done(error);
    }
}

module.exports = {
  removeActivityProcessJob
}
