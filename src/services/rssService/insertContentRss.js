const insertNewsLink = require("./insertNewsLink");

const insertContentRss = async (
  items,
  domainId,
  domainName,
  infoDes,
  logo,
  priority
) => {
  items.forEach(async (item) => {
    try {
      await insertNewsLink(
        item.link,
        domainId,
        domainName,
        infoDes,
        logo,
        item.isoDate,
        priority
      );
    } catch (error) {
      console.log(error);
      console.log("error content rss");
      console.log("error insert content rss: ", item.link);
    }
  });
};

module.exports = insertContentRss;
