const { default: axios } = require("axios");
const cheerio = require("cheerio");
const { postToGetstream } = require("../../processes/domain-process");
const {
  addNewsLink,
  isExsistNewsLink,
} = require("../postgres/NewsLinkService");
const https = require("https");

const insertNewsLink = async (
  link,
  domainPageid,
  name,
  info,
  logo,
  created_article,
  priority
) => {
  try {
    let dateFromArticle = new Date(created_article);
    let current = dateFromArticle.getTime();
    const crawls = await axios.get(link, {
      httpsAgent: new https.Agent({ keepAlive: true }),
      headers: { "User-Agent": "bettersocial" },
    });
    const $ = cheerio.load(crawls.data);
    const site_name = $('meta[property="og:site_name"]').attr("content") || "";
    const title = $('meta[property="og:title"]').attr("content") || "";
    const image = $('meta[property="og:image"]').attr("content") || "";
    let description =
      $('meta[property="og:description"]').attr("content") || "";
    const news_url = $('meta[property="og:url"]').attr("content") || "";
    const url_compact = $('meta[property="og:url"]').attr("content") || "";
    const keyword = $('meta[name="keywords"]').attr("content") || "";
    const author = $('meta[name="author"]').attr("content") || "";
    const statusLink = await isExsistNewsLink(news_url);
    const isLinkAvailable = statusLink?.rows?.length > 0;
    if (!isLinkAvailable) {
      let newsLinkId = await addNewsLink({
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
        created_article: current,
        priority,
      });
      let data = {
        news_link_id: newsLinkId,
        domain_page_id: domainPageid,
        title,
        site_name,
        image,
        description,
        news_url,
        keyword,
        author,
        url_compact,
        url: news_url
      };

      const activity = {
        domain: {
          name,
          site_name,
          info,
          image: logo,
          domain_page_id: domainPageid,
          priority
        },

        content: {
          ...data,
          created_at: dateFromArticle.toISOString(),
          updated_at: dateFromArticle.toISOString(),
        },
      };
      // console.info("activity: ", activity);
      // console.log("link status: ", "link blm ada");
      await postToGetstream(activity);
    } else {
      console.info("link status: ", "link sudah ada");
    }
  } catch (error) {
    console.error('error in insert news link');
    console.error(error?.message);
  }
};

module.exports = insertNewsLink;
