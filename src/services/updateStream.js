const stream = require('getstream');

require("dotenv").config();

const putStream = async (id, set) => {

  // Instantiate a new client (server side)
  const client = stream.connect(process.env.API_KEY, process.env.SECRET, process.env.APP_ID);

  return client.activityPartialUpdate({
    id, set
  })
}

module.exports = {
  putStream
}
