const { Op } = require('sequelize')
const moment = require('moment')

const { DomainPage } = require('../databases/models')
const { updateDomainCredderScore, QUEUE_CREDDER_INTERVAL_IN_DAYS } = require('../utils')
const { credderScoreQueue } = require('../config')

require('dotenv').config()

const credderDailyScoreProcess = async (job, done) => {
    // let { data } = job
    // let success = await updateDomainCredderScore(data.domainName);
    // if(success) return done(null, 'OK')

    // return done(null, 'false')

    console.log(`Running queue at ${moment().format("HH:mm:SS")}`)
    let checkDate = moment().subtract(QUEUE_CREDDER_INTERVAL_IN_DAYS, 'days').format('YYYY-MM-DD');
    console.log(`checkdate ${checkDate}`)

    let domains = await DomainPage.findAll({
        where: {
            [Op.or]: [
                { credder_last_checked: null },
                {
                    credder_last_checked: {
                        [Op.lte]: checkDate
                    }
                }
            ]
        },
        raw: true
    })

    const queueOptions = {
        limiter: {
            max: 300,
            duration: 60 * 1000 //60k ms = 1 minute
        }
    }

    if(domains.length === 0) console.log('======= No domain to check =========')
    // console.log(domains)
    for (let index in domains) {
        let domain = domains[index]
        console.log(`Adding queue for ${domain.domain_name}`)
        credderScoreQueue.add({
            domainName: domain.domain_name
        }, queueOptions)
    }

    return done(null, 'ok')
}

module.exports = {
    credderDailyScoreProcess
}