const stream = require('getstream');

require("dotenv").config();

const deleteStream = async (feedName, uniqueId, activityId) => {

  const client = stream.connect(process.env.API_KEY, process.env.SECRET, process.env.APP_ID);
  const nameFeed = client.feed(feedName, uniqueId);

  const result = nameFeed.removeActivity(activityId);
  console.debug("deleteStream: ", result);
  return result;
}

module.exports = {
  deleteStream
}
