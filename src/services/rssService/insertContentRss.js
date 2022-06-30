const insertNewsLink = require("./insertNewsLink");

const insertContentRss = async (
  items,
  domainId,
  domainName,
  infoDes,
  logo,
  newsLinks
) => {
  items.forEach(async (item) => {
    try {
      await insertNewsLink(
        item.link,
        domainId,
        domainName,
        infoDes,
        logo,
        newsLinks,
        item.isoDate
      );
    } catch (error) {
      console.log(error);
      console.log("error insert content rss: ", item.link);
    }
  });
};

module.exports = insertContentRss;
