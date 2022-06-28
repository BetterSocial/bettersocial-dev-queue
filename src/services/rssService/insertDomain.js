const { addDomain } = require("../postgres/DomainPageService");

const insertDomain = async (link) => {
  let domain_id = await addDomain({
    domain_name: domainName,
    logo,
    short_description:
      description.length > 254 ? description.substring(0, 230) : description,
  });
  let name = domainName;
  let info = description;
  let domain_image = logo;
  return { domain_id, info, domain_image };
};

module.exports = insertDomain;
