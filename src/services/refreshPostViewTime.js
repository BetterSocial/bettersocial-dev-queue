const refreshPostViewTime = async (req, res) => {
  try {
    const db = require('../databases/models')
    const query = `REFRESH MATERIALIZED VIEW vw_post_time`
    await db.sequelize.query(query);
    return res.status(200).json({
      code: 200,
      status: "ok",
      data: "refresh data sucesfully",
    });
  } catch (error) {
    return res.status(500).json({
      code: 500,
      data: null,
      message: "Internal server error",
      error: error.toString(),
    });
  }
}

module.exports = {
  refreshPostViewTime
}
