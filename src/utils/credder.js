const { default: axios } = require("axios")
const { default: moment } = require("moment");
const { DomainPage } = require("../databases/models");

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
            console.log('Checking Domain because valid')
            let domain = await DomainPage.findOne({
                where: { domain_name: datum.outlet.name }
            })

            if (domain) {
                if (!domain.credder_score) {
                    // update credder score & update credder last checked
                    console.log('Updating credder score 1')
                    await __updateCredderScore(domain, datum.outlet.scores.recommended.value)
                }

                let dateDiff = moment().diff(domain.credder_last_checked, 'week')
                console.log(`date diff ${dateDiff} week`)
                if (dateDiff >= 1) {
                    // update credder score & update credder last checked
                    console.log('Updating credder score 2')
                    await __updateCredderScore(domain, datum.outlet.scores.recommended.value)
                }
            }
            // Create new domain here if not existed
        } else if (datum.valid && !datum.indexed) {
            console.log('news link not indexed')
            console.log('Updating credder score 3')
            let domain = await DomainPage.findOne({
                where: { domain_name: domainName }
            });

            if(!domain) return true

            await __updateCredderScore(domain, -1)
        } else {
            console.log('news link not valid')
        }

        return true
    } catch(e) {
        console.log('Error')
        console.log(e)
        return false
    }
}

module.exports = {
    updateDomainCredderScore
}