const stream = require('getstream');

const deleteStream = async (domainName, uniqueId, foreignId) => {
  require("dotenv").config();

  const client = stream.connect(process.env.API_KEY, process.env.SECRET, process.env.APP_ID);
  const nameFeed = client.feed(domainName, uniqueId);

  return nameFeed.removeActivity({ foreignId });
}

deleteStream()
