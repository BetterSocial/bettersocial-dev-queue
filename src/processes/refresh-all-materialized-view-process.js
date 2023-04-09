const { sequelize } = require('../databases/models')

require('dotenv').config()

const refreshAllMaterializedViewProcess = async(job, done) => {
    try {
        await sequelize.query("REFRESH MATERIALIZED VIEW vwm_user_follower_count")
        await sequelize.query("REFRESH MATERIALIZED VIEW vwm_user_common_follower_count")
        await sequelize.query("REFRESH MATERIALIZED VIEW vwm_user_location_follower_count")
        await sequelize.query("REFRESH MATERIALIZED VIEW vwm_user_topic_follower_count_rank")
        return done(null, 'OK')
    } catch (e) {
        return done(null, 'false')
    }
}

module.exports = {
    refreshAllMaterializedViewProcess
}