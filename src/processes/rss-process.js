const axios = require('axios');
const cheerio = require('cheerio');
let Parser = require('rss-parser');
const { postToGetstream } = require('../services/DomainProses');
const { dateCreted, removeSubDomain } = require('../utils/custom');
const { addDomain, getAllDomains } = require('../services/postgres/DomainPageService');
const { getAllRssLinks } = require('../services/postgres/LinkRssService');
const { getAllNewsLinks, addNewsLink } = require('../services/postgres/NewsLinkService');
const { addRssHistory } = require('../services/postgres/RssHistoryService');

const insertDomain = async (link) => {
    const domainName = link.hostname.replace("www.", "");
    const crawls = await axios.get(`${link.protocol}//${link.hostname}`,
        { headers: { 'User-Agent': 'bettersocial' } });
    const $ = cheerio.load(crawls.data);
    const logo = $('meta[property="og:image"]').attr('content') || "";
    const description = $('meta[property="og:description"]').attr('content') || "";
    let domain_id = await addDomain({ domain_name: domainName, logo, short_description: description.length > 254 ? description.substring(0, 230) : description });
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
        await addNewsLink({
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
            domain_page_id: domainPageid, title, site_name, image, description, news_url, keyword, author, url_compact, url: news_url
        };

        const activity = {
            domain: {
                name, site_name, info, image: logo, domain_page_id: domainPageid
            },

            content: { ...data, ...dateCreted }
        }
        console.info('activity: ', activity);
        await postToGetstream(activity);
    } else {
        console.info('link sudah ada');
    }

}

const getRssLinks = async () => {
    let links = await getAllRssLinks();
    return links;
}

const getDomain = (domainName, domains) => {
    if (domains.length === 0) {
        return false;
    }
    let arrDomain = domains.filter((domain, index, arr) => {
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
    let arrDomain = newsLinks.filter((newsLink, index, arr) => {
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

        const rss = await getRssLinks();
        const domains = await getAllDomains();
        const newsLinks = await getAllNewsLinks();
        let dataForRssHistory = [];

        console.info('link: ', rss.link);
        let feed = await parser.parseURL(rss.link);
        let link = new URL(feed.link);
        let domainName = link.hostname.replace("www.", "");
        console.log('before: ', domainName);
        domainName = removeSubDomain(domainName);
        console.log('after: ', domainName);
        let data = {
            'domain_name': domainName,
            'link': link
        }
        dataForRssHistory.push(data);
        let domain = await getDomain(domainName, domains);
        let domainId = null;
        let name = null;
        let infoDes = null;
        let logo = null;
        if (!domain) {
            let { domain_id, info, domain_image } = await insertDomain(link);
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

        await addRssHistory({ domain_name: domainName, link });
        console.log(dataForRssHistory);
        console.log('test');
        done(null, 'success running rss');
        // return dataForRssHistory;
    } catch (error) {
        console.log(error);
        // return error;
        // console.log(error);
        done(null, error);
    }
}

module.exports = {
    rssProcess
};