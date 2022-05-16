const { updateDomainCredderScore } = require('../utils')

require('dotenv').config()

const credderScoreProcess = async(job, done) => {
    let { data } = job
    let success = await updateDomainCredderScore(data.domainName);
    if(success) return done(null, 'OK')

    return done(null, 'false')
}

module.exports = {
    credderScoreProcess
}