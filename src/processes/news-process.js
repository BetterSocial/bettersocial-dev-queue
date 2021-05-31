const getDomainId = async (resp) => {
  try {
    const { v4: uuidv4 } = require('uuid');
    const { DomainPage } = require("../databases/models");
    const getDomain = await DomainPage.findOne({
      where: { domain_name: resp.request.host }
    })
    let domain_page_id
    if (getDomain) {
      domain_page_id = getDomain.dataValues.domain_page_id;
    } else {
      const data = {
        domain_page_id: uuidv4(),
        domain_name: resp.request.host,
        logo: '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      const saveDomain = await DomainPage.create(data);
      domain_page_id = saveDomain.dataValues.domain_page_id
    }

    return domain_page_id
  } catch (error) {
    return error
  }
}

const saveNewsLink = async (data) => {
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
      data.news_link_id = uuidv4();
      data.created_at = new Date().toISOString();
      data.updated_at = new Date().toISOString();
      data.url = data.news_url;
      await NewsLink.create(data)
      message = 'created'
    }

    return message
  } catch (error) {
    return error
  }
}

const newsJob = (job) => {
  try {
    console.info('news job is working! with id' + job.id);
    console.info('data' + job.data);
    console.info('body' + job.data.body);
    const axios = require('axios');
    const cheerio = require('cheerio');
    axios.get(JSON.stringify(job.data.body)).then(async resp => {
      const domain_page_id = await getDomainId(resp);
      const $ = cheerio.load(resp.data);
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

      const result = await saveNewsLink(data);

      console.info(result);
    });
  } catch (error) {
    return error;
  }
}

module.exports = {
  newsJob
};
