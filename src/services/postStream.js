const stream = require('getstream');

require("dotenv").config();

const postStream = async (feedName, uniqueName, activity) => {

  // Instantiate a new client (server side)
  const client = stream.connect(process.env.API_KEY, process.env.SECRET, process.env.APP_ID);

  const nameFeed = client.feed(feedName, uniqueName);

  // Add an activity to the feed
  return await nameFeed.addActivity(activity);
}

module.exports = {
  postStream
}
