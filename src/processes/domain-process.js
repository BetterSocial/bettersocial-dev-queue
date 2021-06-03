const { postStream } = require("../services");
const { DOMAIN } = require('../utils')
const postToGetstream = async (activity) => {
  const { v4: uuidv4 } = require('uuid');
  try {

    activity.actor = []
    activity.object = []
    activity.count_downvote = 0
    activity.count_upvote = 0
    activity.id = uuidv4()
    activity.foreign_id = `${uuidv4()}${new Date().getTime()}`
    activity.verb = "tweet"

    const domainName = activity.domain.name
    const result = await postStream(DOMAIN, domainName.split('.').join('-'), activity);
    console.info('success post to getstream');
    return result
  } catch (error) {
    console.info(error);
    return error;
  }
}
module.exports = {
  postToGetstream
}