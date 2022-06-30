let Parser = require("rss-parser");

const parserRss = async (linkRss) => {
  try {
    let parser = new Parser({
      customFields: {
        item: ["media:content"],
      },
    });
    let feed = await parser.parseURL(linkRss);
    return feed;
  } catch (error) {
    console.log("error in link: ", linkRss);
  }
};

module.exports = parserRss;
