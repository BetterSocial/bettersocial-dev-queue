const { removeSubDomain } = require("../../utils");
const insertDomain = require("./insertDomain");
const removeWWWFromUrl = require("./removeWWWFromUrl");

const validateDomain = async (linkDomain, listDomains) => {
  let url = await generateUrl(linkDomain);
  let domainName = removeWWWFromUrl(url);

  let domain = await getDomain(domainName, listDomains);
  let domainId = null;
  let name = null;
  let infoDes = null;
  let logo = null;
  if (!domain) {
    let { domain_id, info, domain_image } = await insertDomain(url, domainName);
    domainId = domain_id;
    infoDes = info;
    logo = domain_image;
  } else {
    domainId = domain.domain_page_id;
    name = domain.domain_name;
    infoDes = domain.description;
    logo = domain.logo;
  }
  let res = {
    domainId,
    domainName,
    infoDes,
    logo,
  };
  return res;
};

const generateUrl = async (linkDomain) => {
  let link = new URL(linkDomain);
  return link;
};

const getDomain = (domainName, listDomains) => {
  if (listDomains.length === 0) {
    return false;
  }
  let arrDomain = listDomains.filter((domain, index, arr) => {
    return domain.domain_name == domainName;
  });
  if (arrDomain.length == 0) {
    return false;
  }
  return arrDomain[0];
};

module.exports = validateDomain;
