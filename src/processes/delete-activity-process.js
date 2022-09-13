const stream = require('getstream');

const deleteActivityProcessJob = async (job, done) => {

    // console.log("deleteActivityProcessJob: " + JSON.stringify(job.data));
    try {
        // Remove activity from get stream
        let data = job.data;
        let { feedName, userId, activityId } = data;
        const client = stream.connect(process.env.API_KEY, process.env.SECRET, process.env.APP_ID);
        const nameFeed = client.feed(feedName, userId);
        const result = await nameFeed.removeActivity(activityId);
        done(null, result);
    } catch (error) {
        console.error(error);
        done(error);
    }
}

module.exports = {
    deleteActivityProcessJob
}