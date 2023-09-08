const stream = require('getstream');
const {successResponse, errorResponse} = require('../utils');
require('dotenv').config();
const {removeActivityQueue} = require('../config');

const getStreamClient = async () =>
  stream.connect(process.env.API_KEY, process.env.SECRET, process.env.APP_ID);

const getActivityById = async (req, res) => {
  try {
    const {activity_id} = req.body;
    const client = getStreamClient();
    const success = await client.getActivities({ids: [activity_id]});
    return successResponse(res, 'Activity detail', success);
  } catch (error) {
    return errorResponse(res, error.toString(), 500);
  }
};

const removeActivityProcess = async (feed_group, feed_id, activity_id) => {
  const client = await getStreamClient();
  const feed = client.feed(feed_group, feed_id);
  const result = await feed.removeActivity(activity_id);
  console.log(result);
  // console.log(activity_id, result);
  return result;
};

const removeActivityById = async (req, res) => {
  try {
    const {feed_group, feed_id, activity_id} = req.body;
    // const result = await removeActivityProcess(feed_group, feed_id, activity_id);
    // return successResponse(
    //   res,
    //   `Remove Activity detail ${activity_id} from feed_id ${feed_group}:${feed_id}`,
    //   result
    // );
    // by queue
    const result = removeActivityQueue.add(
      {
        feed_group,
        feed_id,
        activity_id
      },
      {delay: 60000 * 10}
    );
    return successResponse(res, 'Activity detail', result);
  } catch (error) {
    return errorResponse(res, error.toString(), 500);
  }
};

module.exports = {
  getActivityById,
  removeActivityById,
  removeActivityProcess
};
