const { addDomain } = require("../postgres/DomainPageService");
const axios = require("axios");
const cheerio = require("cheerio");

const insertDomain = async (link, domainName) => {
  const crawls = await axios.get(`${link.protocol}//${link.hostname}`, {
    headers: { "User-Agent": "bettersocial" },
  });
  const $ = cheerio.load(crawls.data);
  const logo = $('meta[property="og:image"]').attr("content") || "";
  const description =
    $('meta[property="og:description"]').attr("content") || "";
  let domain_id = await addDomain({
    domain_name: domainName,
    logo,
    short_description:
      description.length > 254 ? description.substring(0, 230) : description,
  });
  let name = domainName;
  let info = description;
  let domain_image = logo;
  return { domain_id, info, domain_image };
};

module.exports = insertDomain;
