const validateNewsLink = (url, newsLinks) => {
  if (newsLinks.length === 0) {
    return false;
  }
  let arrDomain = newsLinks.filter((newsLink, index, arr) => {
    return newsLink.news_url == url;
  });
  if (arrDomain.length == 0) {
    return false;
  }
  return arrDomain[0];
};

module.exports = validateNewsLink;
