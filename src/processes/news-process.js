const validateDomain = async (resp) => {
  try {
    const { DomainPage } = require("../databases/models");
    const getDomain = await DomainPage.findOne({
      where: { domain_name: resp.request.host }
    })
    let domain_id;
    let name;
    let info;
    let domain_image;
    let created_domain;
    if (getDomain) {
      domain_id = getDomain.dataValues.domain_page_id;
      name = getDomain.dataValues.domain_name;
      info = getDomain.dataValues.description;
      domain_image = getDomain.dataValues.logo;
      created_domain = getDomain.dataValues.created_at;
    } else {
      const axios = require('axios');
      const cheerio = require('cheerio');
      const crawls = await axios.get(`${resp.request.protocol}//${resp.request.host}`);
      const $ = cheerio.load(crawls.data);
      const logo = $('meta[property="og:image"]').attr('content') || "";
      const description = $('meta[property="og:description"]').attr('content') || "";
      const { v4: uuidv4 } = require('uuid');
      const data = {
        domain_page_id: uuidv4(),
        domain_name: resp.request.host,
        logo, description,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      await DomainPage.create(data);

      domain_id = data.domain_page_id;
      name = data.domain_name;
      info = data.description;
      domain_image = data.logo;
      created_domain = data.created_at;
    }

    return { domain_id, name, info, domain_image, created_domain }
  } catch (error) {
    return error
  }
}

const putMainFeed = async (job, name, logo, created, data) => {
  const { putStream } = require('../services');
  const { setPostScore } = require('../processes/domain-process')
  const { postPerformanceScoreProcess } = require('../processes/post-perfomance-process')
  const score = await setPostScore(job.user_id)
  try {
    const set = {
      post_type: 2,
      og: {
        domain: name,
        date: created,
        domainImage: logo,
        title: data.title,
        description: data.description,
        image: data.image,
        url: data.news_url,
      },...score,...postPerformanceScoreProcess
    }
    await putStream(job.id_feed, set);
    console.info(`updated main_feed:${job.id_feed}`)
  } catch (error) {
    console.info(error)
  }
}

const saveNewsLink = async (data, name, info, job, logo, created_domain) => {
  try {
    const { NewsLink } = require("../databases/models");
    const findNewsLink = await NewsLink.findOne({
      where: { news_url: data.news_url }
    })
    let message
    if (findNewsLink) {
      message = 'url news not unique'
    } else {
      const { v4: uuidv4 } = require('uuid');
      const { postToGetstream } = require('./domain-process');

      data.news_link_id = uuidv4();
      data.created_at = new Date().toISOString();
      data.updated_at = new Date().toISOString();
      data.url = data.news_url;

      await NewsLink.create(data)

      const site_name = data.site_name
      const activity = {
        domain: {
          name, site_name, info, image:logo
        },
        content: data
      }

      await postToGetstream(activity, job.user_id);
      await saveCounterPost(job.user_id);
      await putMainFeed(job, name, logo, created_domain, data);
      message = 'news link created'
    }

    return message
  } catch (error) {
    return error
  }
}

const saveCounterPost = async (user_id) => {
  const moment = require("moment")
  const { v4: uuidv4 } = require('uuid');
  try {
    const date = moment(new Date()).format("YYYY-MM-DD");

    const data = {}
    data.id_statistic = uuidv4();
    data.created_at = new Date().toISOString();
    data.updated_at = new Date().toISOString();
    data.user_id = user_id;
    data.counter = 1;
    data.date = date;

    const { StatisticPost } = require("../databases/models");
    const findPostToday = await StatisticPost.count({
      where : { user_id, date }
    });
    /*
      @description if exist post today counter else creatae post counter
    */
    if (findPostToday) {
      await StatisticPost.increment(
        { counter: +1 },
        { where: { user_id, date } }
      );
    } else {
      await StatisticPost.create(data);
    }
    console.info("counter created");
  } catch (error) {
    console.info(error);
  }
}

const newsJob = async (job, done) => {
  try {
    console.info('news job is working! with id ' + job.id);
    const axios = require('axios');
    const cheerio = require('cheerio');

    /*
      @description crawls data from url post getstream
    */
    const crawls = await axios.get(job.data.body);
    /*
      @description validate domain if exist get data or empty create data domain to table domain
    */
    const getDomain = await validateDomain(crawls);
    const domain_page_id = getDomain.domain_id;
    const name = getDomain.name;
    const info = getDomain.info;
    const logo = getDomain.domain_image;
    const created_domain = getDomain.created_domain;
    /*
      @description crawls attribut opengraph url domain
    */
    const $ = cheerio.load(crawls.data);
    const site_name = $('meta[property="og:site_name"]').attr('content') || "";
    const title = $("title").text();
    const image = $('meta[property="og:image"]').attr('content') || "";
    const description = $('meta[property="og:description"]').attr('content') || "";
    const news_url = $('meta[property="og:url"]').attr('content') || "";
    const keyword = $('meta[name="keywords"]').attr('content') || "";
    const author = $('meta[name="author"]').attr('content') || "";

    /*
      @description define data for post to getstream and newslink table
    */
    const data = {
      domain_page_id, title, site_name, image, description, news_url, keyword, author
    };

    /*
      @description save news link and post to getstream
    */
    const result = await saveNewsLink(data, name, info, job.data, logo, created_domain);
    console.info(result);
    done(null , result);
  } catch (error) {
    done(null , error);
  }
}

module.exports = {
  newsJob
};
