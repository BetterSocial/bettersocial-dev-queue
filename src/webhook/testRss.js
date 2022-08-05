const {
    testQueue,
    weeklyCredderUpdateQueue,
    credderScoreQueue,
    dailyRssUpdateQueue,
} = require("../config");
const { postToGetstream } = require("../processes/domain-process");
const { rssProcess } = require("../processes/rss-process");
const crawlingDomain = require("../services/rssService/crawlingDomain");
const insertDomain = require("../services/rssService/insertDomain");
const rssService = require("../services/rssService/rssService");
const { dateCreted } = require("../utils");
const testRss = async (req, res) => {
    try {
        let result = dailyRssUpdateQueue.add()
        return res.json({
            status: 'ok',
            result: result,
        })
    } catch (error) {
        console.log("error");
        console.log(error);
        return res.json({
            ststus: "error",
            message: error,
        });
    }

};

module.exports = { testRss };
