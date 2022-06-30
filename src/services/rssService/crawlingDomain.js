const axios = require("axios");
const cheerio = require("cheerio");

/**
 * 
 * @param {*} link
 * @returns
 * @example link {
  href: 'https://www.nytimes.com/section/world',
  origin: 'https://www.nytimes.com',
  protocol: 'https:',
  username: '',
  password: '',
  host: 'www.nytimes.com',
  hostname: 'www.nytimes.com',
  port: '',
  pathname: '/section/world',
  search: '',
  searchParams: URLSearchParams {},
  hash: ''
}
 */
const crawlingDomain = async (link) => {
  const domainName = link.hostname.replace("www.", "");
  const crawls = await axios.get(`${link.protocol}//${link.hostname}`, {
    headers: { "User-Agent": "bettersocial" },
  });
  const $ = cheerio.load(crawls.data);
  const logo = $('meta[property="og:image"]').attr("content") || "";
  const description =
    $('meta[property="og:description"]').attr("content") || "";

  let data = {
    domain_name: domainName,
    logo,
    short_description: description,
  };

  return data;
};

module.exports = crawlingDomain;
