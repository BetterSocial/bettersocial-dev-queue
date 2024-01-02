const stream = require('getstream');

const unFollowFeedProcessJob = async (job, done) => {
  try {
    const data = job.data;
    const {feedName, userId, targetFeed, unfollowUserId} = data;
    const client = stream.connect(process.env.API_KEY, process.env.SECRET, process.env.APP_ID);
    const nameFeed = client.feed(feedName, userId);
    const result = await nameFeed.unfollow(targetFeed, unfollowUserId);
    done(null, result);
  } catch (error) {
    console.error(error);
    done(error);
  }
};

module.exports = {
  unFollowFeedProcessJob
};
