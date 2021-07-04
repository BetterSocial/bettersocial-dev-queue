const refreshPostViewTime = async (req, res) => {
  try {
    const { successResponse, errorResponse } = require('../utils');
    const db = require('../databases/models');
    const query = `REFRESH MATERIALIZED VIEW vw_post_time`
    await db.sequelize.query(query);
    return successResponse(res, "refresh data sucesfully", []);
  } catch (error) {
    return errorResponse(res, error.toString(), 500);
  }
}

module.exports = {
  refreshPostViewTime
}
