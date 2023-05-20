const stream = require("getstream");
const { callFn } = require("../utils/limiter");

require("dotenv").config();

const putStream = async (id, set) => {
  // Instantiate a new client (server side)
  const client = stream.connect(
    process.env.API_KEY,
    process.env.SECRET,
    process.env.APP_ID
  );

  return await callFn(
    client.activityPartialUpdate({
      id,
      set,
    }),
    5 * 1000,
    2,
    60 * 1000
  );
};

module.exports = {
  putStream,
};
