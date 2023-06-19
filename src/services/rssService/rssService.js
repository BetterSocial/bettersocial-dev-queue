const { getAllDomains } = require("../postgres/DomainPageService");
const { getAllRssLinks } = require("../postgres/LinkRssService");
const { getAllNewsLinks } = require("../postgres/NewsLinkService");
const { addRssHistory } = require("../postgres/RssHistoryService");
const insertContentRss = require("./insertContentRss");
const parserRss = require("./parserRss");
const validateDomain = require("./validateDomain");

const rssService = async () => {
  const rsslinks = await getAllRssLinks();
  rsslinks.forEach(async (rss) => {
    try {
      let feed = await parserRss(rss.link);
      if(feed?.link?.trim()) {
        let { domainId, domainName, infoDes, logo } = await validateDomain(
          feed?.link
        );
        await insertContentRss(
          feed.items,
          domainId,
          domainName,
          infoDes,
          logo,
          rss.priority
        );
      }
    } catch (error) {
      console.log("error rss");
      console.log("error in di: ", error);
    }
  });

  await addRssHistory({
    domain_name: "test domain",
    link: rsslinks[rsslinks.length - 1].link,
  });
};

module.exports = rssService;
