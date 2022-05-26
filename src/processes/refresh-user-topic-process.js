const { sequelize } = require('../databases/models')

require('dotenv').config()

const refreshUserTopicFollower = async(job, done) => {
    let success = await sequelize.query("REFRESH MATERIALIZED VIEW vwm_user_topic_follower_count_rank")
    if(success) return done(null, 'OK')

    return done(null, 'false')
}

module.exports = {
    refreshUserTopicFollower
}