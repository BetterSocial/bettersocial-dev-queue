const axios = require('axios');
const cheerio = require('cheerio');
let Parser = require('rss-parser');
const { postToGetstream } = require('../services/DomainProses');
const DomainPageService = require("../services/postgres/domainPageService");
const LinkRssService = require('../services/postgres/LinkRssService');
const NewsLinkService = require('../services/postgres/NewsLinkService');
const { dateCreted } = require('../utils/custom');
const domainService = new DomainPageService();
let newsLinkService = new NewsLinkService();

const insertDomain = async (link) => {
  const domainName = link.hostname.replace("www.", "");
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

const insertNewsLink = async (link, domainPageid, name, info, logo, newsLinks) => {
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
  const statusLink = getNewsLink(news_url, newsLinks);
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
      domain_page_id : domainPageid, title, site_name, image, description, news_url, keyword, author, url_compact, url: news_url
    };
    
    const activity = {
      domain: {
        name, site_name, info, image: logo, domain_page_id: domainPageid
      },
      
      content: { ...data, ...dateCreted }
    }

    await postToGetstream(activity);
  } else {
    console.info('link sudah ada');
  }
  
}

const getRssLinks = async () => {
  let newsLinkService = new LinkRssService();
  let links = await newsLinkService.getAllRssLinks();
  return links;
}

const getDomain = (domainName, domains) => {
  if (domains.length === 0) {
    return false;
  }
  let arrDomain =  domains.filter((domain, index, arr) => {
    return domain.domain_name == domainName
  })
  if (arrDomain.length == 0) {
    return null;
  }
  return arrDomain[0];
}

const getNewsLink = (link, newsLinks) => {
  if (newsLinks.length === 0) {
    return false;
  }
  let arrDomain =  newsLinks.filter((newsLink, index, arr) => {
    return newsLink.news_url == link
  })
  if (arrDomain.length == 0) {
    return false;
  }
  return arrDomain[0];
}

const rssProcess = async (job, done) => {
  try {
  let parser = new Parser({
    customFields: {
      item: ['media:content'],
    }
  });
  const rssLinks = await getRssLinks();
  const domains = await domainService.getAllDomains();
  const newsLinks = await newsLinkService.getAllNewsLinks();
  

    rssLinks.map(async(rss) => {
    let feed = await parser.parseURL(rss.link );
    let link = new URL(feed.link);
    const domainName =  link.hostname.replace("www.", "");
    let domain = await getDomain(domainName, domains);
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
      await insertNewsLink(item.link, domainId, domainName, infoDes, logo, newsLinks);
    });

  });
  
    done(null, 'success running rss');
  } catch (error) {
    console.log(error);
    done(null, error);
  }
}

module.exports = {
  rssProcess
};