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
const serviceTestQueue = async (req, res) => {
    let { url } = req.body;
    try {
        let data = {
            token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiMDlkNDgyMDItOTUzNS00MmRiLTkzNDUtNzU1MjdiNmFhY2I4IiwiZXhwIjoxNjU5NjI0MTc1fQ.MenYtyFNnF7xK0DDLa5b0c-A9IGy4ltCn6GjaqmLY4w',
            userId: '09d48202-9535-42db-9345-75527b6aacb8',
            locationsChannel: ['aguas-buenas',
                'puerto-rico',
                'us',
                'indonesia',
                'alaska',
                'repto-tres-palmas',
                'aguadilla'],
            follows: [
                '6fff4a2c-28d3-46e0-b2e8-7d04934af5b8',
                '189cc14d-cb6e-4a1c-9941-47764ffc662d'
            ],
            topics: ['Black'],
            locations: [
                {
                    location_id: '46',
                    zip: '',
                    neighborhood: '',
                    city: 'Aguas Buenas, PR',
                    state: 'Puerto Rico',
                    country: 'US',
                    location_level: 'City',
                    status: 'Y',
                    slug_name: '',
                    createdAt: '2022-05-30T07:15:24.000Z',
                    updatedAt: '2022-05-30T07:15:24.000Z'
                },
                {
                    location_id: '29890',
                    zip: '',
                    neighborhood: '',
                    city: '',
                    state: '',
                    country: 'Indonesia',
                    location_level: 'Country',
                    status: 'Y',
                    slug_name: '',
                    createdAt: '2022-05-30T07:22:48.000Z',
                    updatedAt: '2022-05-30T07:22:48.000Z'
                },
                {
                    location_id: '30030',
                    zip: '',
                    neighborhood: '',
                    city: '',
                    state: 'Alaska',
                    country: 'US',
                    location_level: 'State',
                    status: 'Y',
                    slug_name: '',
                    createdAt: '2022-05-30T07:22:48.000Z',
                    updatedAt: '2022-05-30T07:22:48.000Z'
                },
                {
                    location_id: '30107',
                    zip: '',
                    neighborhood: 'Repto Tres Palmas',
                    city: 'Aguadilla, PR',
                    state: 'Puerto Rico',
                    country: 'US',
                    location_level: 'Neighborhood',
                    status: 'Y',
                    slug_name: '',
                    createdAt: '2022-05-30T07:22:48.000Z',
                    updatedAt: '2022-05-30T07:22:48.000Z'
                }
            ]
        }
        let { token,
            userId,
            locationsChannel,
            follows,
            topics,
            locations } = data;
        // let result = await followTopic(userId, topics);
        return res.json({
            status: 'ok',
            result: result,
        })
    } catch (error) {
        console.error("error");
        console.error(error);
        return res.json({
            ststus: "error",
            message: error,
        });
    }

};

module.exports = { serviceTestQueue };
