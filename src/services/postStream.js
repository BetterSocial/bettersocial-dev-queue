const stream = require('getstream');
const ElasticNewsLink = require('../elasticsearch/repo/newsLink/ElasticNewsLink');
const { DOMAIN } = require('../utils');

require("dotenv").config();

const postStream = async (feedName, uniqueName, activity) => {

  // Instantiate a new client (server side)
  const client = stream.connect(process.env.API_KEY, process.env.SECRET, process.env.APP_ID);

  const nameFeed = client.feed(feedName, uniqueName);
  
  // const domainAll = client.feed(feedName, 'all');
  // await domainAll.addActivity(activity);
  
  // Add an activity to the feed
  let returnActivity = await nameFeed.addActivity(activity);
  if(feedName === DOMAIN) {
    // console.log('Indexing getstream object to better social elastic search')
    try {
      new ElasticNewsLink().putToIndexFromGetstreamObject(returnActivity)
    } catch(e) {
      console.error('gagal')
    }
  }
  return returnActivity
}

module.exports = {
  postStream
}
