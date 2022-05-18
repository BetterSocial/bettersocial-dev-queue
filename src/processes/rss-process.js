const axios = require('axios');
const cheerio = require('cheerio');
let Parser = require('rss-parser');
const { postToGetstream } = require('../services/getstream/DomainProses');
const DomainPageService = require("../services/postgres/domainPageService");
const NewsLinkService = require('../services/postgres/NewsLinkService');
const { dateCreted } = require('../utils/custom');
const domainService = new DomainPageService();
let newsLinkService = new NewsLinkService();

const insertDomain = async (link) => {
  const crawls = await axios.get(`${link.protocol}//${link.hostname}`,
        { headers: { 'User-Agent': 'bettersocial' } });
  const $ = cheerio.load(crawls.data);
  const logo = $('meta[property="og:image"]').attr('content') || "";
  const description = $('meta[property="og:description"]').attr('content') || "";
  let domain_id = await domainService.addDomain({domain_name: domainName, logo, short_description: description.length > 254 ? description.substring(0, 230) : description});
  let name = domainName;
  let info = description;
  let domain_image = logo;
  return { domain_id, info, domain_image }
      
}

const insertNewsLink = async (link, domainPageid, name, info, logo) => {
    const crawls = await axios.get(link, { headers: { 'User-Agent': 'bettersocial' } });
    const $ = cheerio.load(crawls.data);
      const site_name = $('meta[property="og:site_name"]').attr('content') || "";
      const title = $('meta[property="og:title"]').attr('content') || "";
      const image = $('meta[property="og:image"]').attr('content') || "";
      let description = $('meta[property="og:description"]').attr('content') || "";
      const news_url = $('meta[property="og:url"]').attr('content') || "";
      const url_compact = $('meta[property="og:url"]').attr('content') || "";
      const keyword = $('meta[name="keywords"]').attr('content') || "";
      const author = $('meta[name="author"]').attr('content') || "";
  const statusLink = await newsLinkService.isExsistNewsLink(news_url);
  if (!statusLink) {
    await newsLinkService.addNewsLink({
      news_url,
      domain_page_id: domainPageid,
      site_name,
      title,
      image,
      description,
      url: news_url,
      keyword,
      author,
      url_compact,
    });
    let data = {
      domain_page_id : domainPageid, title, site_name, image, description, news_url, keyword, author, url_compact
    };
    const activity = {
      domain: {
        name, site_name, info, image: logo, domain_page_id: domainPageid
      },
      content: { ...data, ...dateCreted }
    }
    await postToGetstream(activity);
  } else {
    console.log('link sudah ada');
  }
  
}

const rssProcess = async (req, res) => {
  try {
  let parser = new Parser({
    customFields: {
      item: ['media:content'],
    }
  });
  let {url} = req.query;
  
  let feed = await parser.parseURL(url);
  
  let link = new URL(feed.link);
  const domainName = link.hostname.replace("www.", "");
  let domain =  await domainService.getDomainByDomainName(domainName);
  let domainId = null;
  let name = null;
  let infoDes = null;
  let logo = null;
  if (!domain) {
     let {domain_id, info, domain_image} = await insertDomain(link);
     domainId = domain_id;
     infoDes = info;
     logo = domain_image;
  } else {
    domainId = domain.domain_page_id;
    name = domain.domain_name;
    infoDes = domain.description;
  }
  feed.items.forEach(async (item) => {
    await insertNewsLink(item.link, domainId, domainName, infoDes, logo);
  });
  return res.json({
    'status': 'ok',
    'data': data,
  });
    
  } catch (error) {
    console.log(error);
    return res.json({
      'status': 'error',
      'data': error,
    });
  }
}

module.exports = rssProcess;