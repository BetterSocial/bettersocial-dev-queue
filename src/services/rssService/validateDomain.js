const { getDomainByDomainName } = require("../postgres/DomainPageService");
const insertDomain = require("./insertDomain");
const removeWWWFromUrl = require("./removeWWWFromUrl");

const validateDomain = async (linkDomain) => {
  let url = await generateUrl(linkDomain);
  let domainName = removeWWWFromUrl(url);

  let domain = await getDomainByDomainName(domainName);
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

module.exports = validateDomain;
