const { sequelize } = require('../databases/models')

require('dotenv').config()

const refreshUserCommonFollowerMaterializedViewProcess = async(job, done) => {
    let success = await sequelize.query("REFRESH MATERIALIZED VIEW vwm_user_common_follower_count")
    if(success) return done(null, 'OK')

    return done(null, 'false')
}

module.exports = {
    refreshUserCommonFollowerMaterializedViewProcess
}