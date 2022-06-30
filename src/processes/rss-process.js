const rssService = require("../services/rssService/rssService");

const rssProcess = async (job, done) => {
  try {
    await rssService();
    done(null, "success running rss");
  } catch (error) {
    console.log(error);
    done(null, error);
  }
};

module.exports = {
  rssProcess,
};
