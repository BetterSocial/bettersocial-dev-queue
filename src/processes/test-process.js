const { default: axios } = require('axios');
const moment = require('moment');
const { DomainPage } = require('../databases/models');
const { updateDomainCredderScore } = require('../utils');
// const { validateDomain } = require('./news-process');

require('dotenv').config();

/**
 * 
 * @param {Object} job 
 * @param {Function} done 
 */
// const testProcess = async (job, done) => {
//     try {
//         console.log('running test job')

//         let { data } = job
//         let response = await axios({
//             method: 'GET',
//             url: process.env.CREDDER_API_URL,
//             params: { q: data.url.join() },
//             headers: { 'Content-Type': 'application/json' },
//             auth: {
//                 username: process.env.CREDDER_API_KEY_ID,
//                 password: process.env.CREDDER_API_KEY_SECRET,
//             },
//         })

//         for (let index in response.data.data) {
//             let datum = response.data.data[index]
//             console.log('\n')
//             console.log(datum.request_url)
//             console.log(JSON.stringify(datum))
//             // console.log("\n")

//             if (datum.valid && datum.indexed) {
//                 // Check if domain existed
//                 console.log('Checking Domain because valid')
//                 let domain = await DomainPage.findOne({
//                     where: { domain_name: datum.outlet.name }
//                 })

//                 if (domain) {
//                     if (!domain.credder_score) {
//                         // update credder score & update credder last checked
//                         console.log('Updating credder score 1')
//                         await domain.update({
//                             credder_score: datum.outlet.scores.recommended.value,
//                             credder_last_checked: new Date()
//                         })

//                         await domain.save()
//                         continue
//                     }

//                     let dateDiff = moment().diff(domain.credder_last_checked, 'week')
//                     console.log(`date diff ${dateDiff} week`)
//                     if (dateDiff >= 1) {
//                         // update credder score & update credder last checked
//                         console.log('Updating credder score 2')
//                         await domain.update({
//                             credder_score: datum.outlet.scores.recommended.value,
//                             credder_last_checked: new Date()
//                         })

//                         await domain.save()
//                         continue
//                     }
//                 }
//                 // Create new domain here if not existed
//             } else if(datum.valid && !datum.indexed) {
//                 console.log('news link not indexed')
//                 // console.log('Updating credder score 3')
//                 // await domain.update({
//                 //     credder_score: -1,
//                 //     credder_last_checked: new Date()
//                 // })

//                 // await domain.save()
//             } else {
//                 console.log('news link not valid')
//             }
//         }
//         // console.log(data)
//         done(null, 'ok')
//     } catch (error) {
//         console.log(error)
//         done(null, error)
//     }

// }

const testProcess = async (job, done) => {
    // let { data } = job;
    // const crawls = await axios.get(job.data.url, { headers: { 'User-Agent': 'bettersocial' } });
    // await validateDomain(crawls)
    done(null, 'ok')
}

module.exports = {
    testProcess
}