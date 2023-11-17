const {successResponse, errorResponse} = require('../../utils');
const {removeActivityProcess} = require('../getStreamActivities');

const removeActivity = async (req, res) => {
  try {
    const {activity_id} = req.body;
    const result = await removeActivityProcess('', '', activity_id);
    return successResponse(res, 'remove activity sucesfully', result);
  } catch (error) {
    console.log(error);
    return errorResponse(res, error.toString(), 500);
  }
};

module.exports = {
  removeActivity
};
