const stream = require('getstream');
const Sentry = require('@sentry/node');

const unFollowFeedProcessJob = async (job, done) => {
  try {
    const {data} = job;
    const {feedName, userId, targetFeed, unfollowUserId} = data;
    const client = stream.connect(process.env.API_KEY, process.env.SECRET, process.env.APP_ID);
    const nameFeed = client.feed(feedName, userId);
    const result = await nameFeed.unfollow(targetFeed, unfollowUserId);
    done(null, result);
  } catch (error) {
    Sentry.captureException(error);
    console.error(error);
    done(error);
  }
};

module.exports = {
  unFollowFeedProcessJob
};
