const {removeActivityProcess} = require('../services/getStreamActivities');

const removeActivityProcessJob = async (job, done) => {
  try {
    const {data} = job;
    const {feed_group, feed_id, activity_id} = data;
    await removeActivityProcess(feed_group, feed_id, activity_id);
    done(null, 'ok');
  } catch (error) {
    console.error(error);
    done(error);
  }
};

module.exports = {
  removeActivityProcessJob
};
