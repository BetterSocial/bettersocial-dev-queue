/* eslint-disable no-param-reassign */
/* eslint-disable camelcase */
const axios = require('axios');
const cheerio = require('cheerio');
const {v4: uuidv4} = require('uuid');
const {DomainPage, NewsLink} = require('../databases/models');
const {dateCreted, removeSubDomain, checkIfValidURL} = require('../utils');
const {credderScoreQueue} = require('../config');
const ElasticNewsLink = require('../elasticsearch/repo/newsLink/ElasticNewsLink');
const {putStream} = require('../services');
const {postToGetstream} = require('./domain-process');

const validateDomain = async (resp) => {
  try {
    let removeWww = resp.request.host.replace('www.', '');
    removeWww = removeSubDomain(removeWww);
    const getDomain = await DomainPage.findOne({
      where: {domain_name: removeWww}
    });

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
      const crawls = await axios.get(`${resp.request.protocol}//${resp.request.host}`, {
        headers: {'User-Agent': 'bettersocial'}
      });
      const $ = cheerio.load(crawls.data);
      const logo = $('meta[property="og:image"]').attr('content') || '';
      const description = $('meta[property="og:description"]').attr('content') || '';
      const domainId = uuidv4();
      const data = {
        domain_page_id: domainId,
        domain_name: removeWww,
        short_description: description.length > 254 ? description.substring(0, 230) : description,
        logo,
        ...dateCreted
      };

      await DomainPage.create(data);

      domain_id = data.domain_page_id;
      name = data.domain_name;
      info = data.description;
      domain_image = data.logo;
      created_domain = data.created_at;
    }

    const queueOptions = {
      limiter: {
        max: 300,
        duration: 60 * 1000 // 60k ms = 1 minute
      }
    };

    credderScoreQueue.add(
      {
        domainName: removeWww
      },
      queueOptions
    );

    return {domain_id, name, info, domain_image, created_domain};
  } catch (error) {
    console.error(error);
    return error;
  }
};

const putMainFeed = async (job, name, logo, created, data, newsLinkFeedId) => {
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
        domain_page_id: data.domain_page_id,
        news_link_id: data.news_link_id,
        news_feed_id: newsLinkFeedId,
        content_published_at: data?.content_published_at
      }
    };
    await putStream(job.id_feed, set);
    console.info(`updated main_feed:${job.id_feed}`);
  } catch (error) {
    console.info(error);
  }
};

const saveNewsLink = async (data, name, info, job, logo, created_domain) => {
  try {
    const findNewsLink = await NewsLink.findOne({
      where: {news_url: data.news_url}
    });
    let message;
    if (findNewsLink) {
      console.info('id', findNewsLink.news_link_id);
      data.news_link_id = findNewsLink.news_link_id;
      data.url = data.news_url;

      const {site_name} = data;
      const activity = {
        domain: {
          name,
          site_name,
          info,
          image: logo,
          domain_page_id: data.domain_page_id
        },
        content: {
          ...data,
          ...dateCreted,
          content_published_at: findNewsLink?.created_article || data?.content_published_at
        }
      };

      await putMainFeed(job, name, logo, created_domain, data, findNewsLink?.post_id);
      await new ElasticNewsLink().putToIndexFromGetstreamObject(findNewsLink);
      // await postToGetstream(activity, job.user_id);
      message = 'url news not unique';
    } else {
      data.news_link_id = uuidv4();
      data.url = data.news_url;

      const {site_name} = data;
      const activity = {
        domain: {
          name,
          site_name,
          info,
          image: logo,
          domain_page_id: data.domain_page_id
        },
        content: {
          ...data,
          ...dateCreted,
          content_published_at: findNewsLink?.created_article || data?.content_published_at
        }
      };

      const result = await postToGetstream(activity, job.user_id);
      await putMainFeed(job, name, logo, created_domain, data, result?.id);

      const postId = result.returnActivityId;
      console.info(result);
      console.info(`postId in Process : ${postId}`);

      const newsLink = await NewsLink.create({
        ...data,
        ...dateCreted,
        post_id: result.id,
        created_article: data.content_published_at
      });
      await new ElasticNewsLink().putToIndexFromGetstreamObject(newsLink);
      message = 'news link created';
    }

    return message;
  } catch (error) {
    return error;
  }
};

const newsJob = async (job, done) => {
  try {
    const validUrl = checkIfValidURL(job.data.body);
    console.info(`running job news! with id ${job.id}`);
    console.info(`running job news! with domain ${validUrl}`);
    /*
          @description crawls data from url post getstream
        */
    console.info('domain: ', checkIfValidURL(validUrl));
    const crawls = await axios.get(validUrl, {headers: {'User-Agent': 'bettersocial'}});

    /*
          @description validate domain if exist get data or empty create data domain to table domain
        */
    const getDomain = await validateDomain(crawls);
    const domain_page_id = getDomain.domain_id;
    const {name, info, created_domain, domain_image: logo} = getDomain;
    let contentPublishedAt = null;

    /*
          @description crawls attribut opengraph url domain
        */
    const $ = cheerio.load(crawls.data);

    const site_name = $('meta[property="og:site_name"]').attr('content') || '';
    const title = $('meta[property="og:title"]').attr('content') || '';
    const image = $('meta[property="og:image"]').attr('content') || '';
    const description = $('meta[property="og:description"]').attr('content') || '';
    // if (description === "") {
    //   description = $('meta[name="description"]').attr('content') || "";
    // }
    const news_url = $('meta[property="og:url"]').attr('content') || '';
    const url_compact = $('meta[property="og:url"]').attr('content') || '';
    const keyword = $('meta[name="keywords"]').attr('content') || '';
    const author = $('meta[name="author"]').attr('content') || '';
    try {
      const ldJson = $("script[type='application/ld+json']")[0]?.children?.at(0)?.data;
      const ldParsedJson = JSON.parse(ldJson);
      contentPublishedAt = ldParsedJson?.datePublished;
    } catch (e) {
      console.error(e);
    }

    /*
          @description define data for post to getstream and newslink table
        */
    const data = {
      domain_page_id,
      title,
      site_name,
      image,
      description,
      news_url,
      keyword,
      author,
      url_compact,
      content_published_at: contentPublishedAt
    };

    /*
          @description save news link and post to getstream
        */
    const result = await saveNewsLink(data, name, info, job.data, logo, created_domain);
    done(null, result);
  } catch (error) {
    console.error('kesalahan', error);
    done(null, error);
  }
};

module.exports = {
  newsJob
  // validateDomain
};
