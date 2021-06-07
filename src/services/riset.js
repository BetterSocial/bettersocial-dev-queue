const stream = require('getstream');

require("dotenv").config();

const postStream = async () => {

  // Instantiate a new client (server side)
  const client = stream.connect(process.env.API_KEY, process.env.SECRET, process.env.APP_ID);

  const nameFeed = client.feed('domain', 'www-kompas-com');
  const dom = client.feed('domain', 'b');

  // Add an activity to the feed
  const activity = {}
  activity.actor = []
  activity.object = []
  activity.count_downvote = 0
  activity.count_upvote = 0
  activity.foreign_id = `tes`
  activity.verb = "post"
  activity.to = ['domain:b'];

  await dom.addActivity(activity);
  return await nameFeed.addActivity(activity);
}

postStream()
