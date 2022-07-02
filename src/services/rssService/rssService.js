const { getAllDomains } = require("../postgres/DomainPageService");
const { getAllRssLinks } = require("../postgres/LinkRssService");
const { getAllNewsLinks } = require("../postgres/NewsLinkService");
const { addRssHistory } = require("../postgres/RssHistoryService");
const insertContentRss = require("./insertContentRss");
const parserRss = require("./parserRss");
const validateDomain = require("./validateDomain");

const rssService = async () => {
  let rsslinks = await getAllRssLinks();
  const listDomains = await getAllDomains();
  const newsLinks = await getAllNewsLinks();
  for (let index = 0; index < rsslinks.length; index++) {
    try {
      const rss = rsslinks[index];
      let feed = await parserRss(rss.link);
      let { domainId, domainName, infoDes, logo } = await validateDomain(
        feed.link,
        listDomains
      );
      await insertContentRss(
        feed.items,
        domainId,
        domainName,
        infoDes,
        logo,
        newsLinks
      );
    } catch (error) {
      console.log("error rss");
      console.log("error in di: ", error);
    }
  }

  await addRssHistory({ domain_name: "test domain", link: rss.link });
};

module.exports = rssService;
