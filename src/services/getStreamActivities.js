const stream = require("getstream");
const { successResponse, errorResponse } = require('../utils');
require("dotenv").config();
const { removeActivityQueue } = require("../config");

const getStreamClient = () => {
  return stream.connect(process.env.API_KEY, process.env.SECRET, process.env.APP_ID);
}

const getActivityById = async (req, res) => {
  try {
    let { activity_id } = req.body
    const client = getStreamClient()
    const success = await client.getActivities({ids: [activity_id]})
    return successResponse(res, "Activity detail", success);
  } catch (error) {
    return errorResponse(res, error.toString(), 500);
  }
}

const removeActivityById = async (req, res) => {
  try {
    let { activity_id } = req.body
    let result = await removeActivityProcess(activity_id)
    return successResponse(res, "Activity detail", result);
    // by queue
    // let result = removeActivityQueue.add({activity_id: activity_id})
    // return successResponse(res, "Activity detail", result);
  } catch (error) {
    return errorResponse(res, error.toString(), 500);
  }
}

const removeActivityProcess = async (activity_id) => {
  const client = getStreamClient()
  const activity = await client.getActivities({ids: [activity_id]})
  let object = JSON.parse(activity.results[0].object)
  let feed = client.feed(object.feed_group, activity.results[0].actor.split(":")[1])
  const result = await feed.removeActivity(activity_id)
  console.log(activity_id, result)
  return result
}

module.exports = {
  getActivityById,
  removeActivityById,
  removeActivityProcess
}
