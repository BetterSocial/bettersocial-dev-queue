const validateDomain = async (resp) => {
  try {
    const { DomainPage } = require("../databases/models");
    const getDomain = await DomainPage.findOne({
      where: { domain_name: resp.request.host }
    })
    let domain_id
    let name
    let info
    let domain_image
    let created_domain
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

const putMainFeed = async (id, name, logo, created, data) => {
  const { putStream } = require('../services');
  try {
    const set = {
      og: {
        domain: name,
        date: created,
        domainImage: logo,
        title: data.title,
        description: data.description,
        image: data.image,
        url: data.news_url,
      }
    }
    await putStream(id, set);
    console.info(`updated main_feed:${id}`)
  } catch (error) {
    console.info(error)
  }
}

const saveNewsLink = async (data, name, info, id_feed, logo, created_domain) => {
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
          name, site_name, info
        },
        content: data
      }

      await postToGetstream(activity);
      await putMainFeed(id_feed, name, logo, created_domain, data);
      message = 'created'
    }

    return message
  } catch (error) {
    return error
  }
}

const newsJob = async (job, done) => {
  try {
    console.info('news job is working! with id ' + job.id);
    const axios = require('axios');
    const cheerio = require('cheerio');
    const crawls = await axios.get(job.data.body);
    const getDomain = await validateDomain(crawls);
    const domain_page_id = getDomain.domain_id;
    const name = getDomain.name;
    const info = getDomain.info;
    const logo = getDomain.domain_image;
    const created_domain = getDomain.created_domain;
    const $ = cheerio.load(crawls.data);
    const site_name = $('meta[property="og:site_name"]').attr('content') || "";
    const title = $("title").text();
    const image = $('meta[property="og:image"]').attr('content') || "";
    const description = $('meta[property="og:description"]').attr('content') || "";
    const news_url = $('meta[property="og:url"]').attr('content') || "";
    const keyword = $('meta[name="keywords"]').attr('content') || "";
    const author = $('meta[name="author"]').attr('content') || "";

    const data = {
      domain_page_id, title, site_name, image, description, news_url, keyword, author
    };

    const result = await saveNewsLink(data, name, info, job.data.id_feed, logo, created_domain);

    console.info(result);
    done(null , result);
  } catch (error) {
    done(null , error);
  }
}

module.exports = {
  newsJob
};
