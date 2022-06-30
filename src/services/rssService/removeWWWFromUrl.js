const { removeSubDomain } = require("../../utils");

const removeWWWFromUrl = (url) => {
  let domainName = url.hostname.replace("www.", "");
  domainName = removeSubDomain(domainName);
  return domainName;
};

module.exports = removeWWWFromUrl;
