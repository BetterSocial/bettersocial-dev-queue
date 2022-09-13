const axios = require("axios")
const moment = require("moment");
const { DomainPage } = require("../databases/models");
const { CREDDER_SCORE_NOT_INDEXED, CREDDER_SCORE_NOT_VALID, QUEUE_CREDDER_INTERVAL_IN_DAYS } = require("./constant");

require('dotenv').config();


const __updateCredderScore = async (domain, score) => {
    await domain.update({
        credder_score: score,
        credder_last_checked: new Date()
    })

    await domain.save();
}

/**
 * 
 * @param {String} domain 
 */
const updateDomainCredderScore = async (domainName) => {
    try {
        let response = await axios({
            method: 'GET',
            url: process.env.CREDDER_API_URL,
            params: { q: domainName },
            headers: { 'Content-Type': 'application/json' },
            auth: {
                username: process.env.CREDDER_API_KEY_ID,
                password: process.env.CREDDER_API_KEY_SECRET,
            },
        })

        let datum = response.data.data[0]

        if (datum.valid && datum.indexed) {
            // console.log('Checking Domain because valid')
            let domain = await DomainPage.findOne({
                where: { domain_name: domainName }
            })

            if (domain) {
                if (!domain.credder_score) {
                    // console.log('Updating credder score 1')
                    await __updateCredderScore(domain, datum.outlet.scores.recommended.value)
                    return true
                }

                let dateDiff = moment().diff(domain.credder_last_checked, 'days')
                if (dateDiff >= QUEUE_CREDDER_INTERVAL_IN_DAYS || domain.credder_last_checked === null) {
                    // update credder score & update credder last checked
                    // console.log('Updating credder score 2')
                    await __updateCredderScore(domain, datum.outlet.scores.recommended.value)
                    return true
                }
            } else {
                // console.log('Updating credder score 3')
                await __updateCredderScore(datum.outlet.name, datum.outlet.scores.recommended.value)
            }

            return true
        } else if (datum.valid && !datum.indexed) {
            // console.log('news link not indexed')
            // console.log('Updating credder score 4')
            let domain = await DomainPage.findOne({
                where: { domain_name: domainName }
            });

            if(!domain) return true

            await __updateCredderScore(domain, CREDDER_SCORE_NOT_INDEXED)
        } else {
            // console.log('news link not valid')
            // console.log('Updating credder score 5')
            let domain = await DomainPage.findOne({
                where: { domain_name: domainName }
            });

            if(!domain) return true

            await __updateCredderScore(domain, CREDDER_SCORE_NOT_VALID)
        }

        return true
    } catch(e) {
        console.error('Error')
        console.error(e)
        return false
    }
}

module.exports = {
    updateDomainCredderScore
}