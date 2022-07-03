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
    // console.log("run test");
    // let value = 1656608400000;
    // let date = new Date(value === Number.is);
    // let test = date.toDateString();
    // let test = await rssService();
    let rss = await rssProcess();
    let link = {
      href: "https://www.nytimes.com/section/world",
      origin: "https://www.nytimes.com",
      protocol: "https:",
      username: "",
      password: "",
      host: "www.nytimes.com",
      hostname: "www.nytimes.com",
      port: "",
      pathname: "/section/world",
      search: "",
      // searchParams: URLSearchParams {},
      hash: "",
    };
    // let rss = await crawlingDomain(link);
    // const job = await dailyRssUpdateQueue.add({
    //   domainName: "kicker.de",
    // });
    // console.log("job ", job.data);
    let data = {
      ...dateCreted,
    };
    return res.json({
      ststus: "success",
      message: data,
    });
  } catch (error) {
    console.log("error");
    console.log(error);
    return res.json({
      ststus: "error",
      message: error,
    });
  }

  // let data = {
  //   domain_page_id: "f30fbb55-5116-40cb-9999-f7a08afc6ddc",
  //   title: "Coba tes",
  //   site_name: "",
  //   image: "",
  //   description: "",
  //   news_url: "",
  //   keyword: "",
  //   author: "",
  //   url_compact: ""
  // };

  // const activity = {
  //   domain: {
  //     name: "",
  //     site_name : "",
  //     info: "",
  //     image: null,
  //     domain_page_id: data.domain_page_id
  //   },

  //   content: { ...data, ...dateCreted }
  // }
  // await postToGetstream(activity)
};

module.exports = { serviceTestQueue };
