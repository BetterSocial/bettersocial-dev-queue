const stream = require("getstream");
const { callFn, sleep } = require("../utils/limiter");

const axios = require("axios");
const UpdateActivity = require("../getstream/updateStream");

require("dotenv").config();
const updateActivity = new UpdateActivity();

const putStream = async (id, set) => {
  // Instantiate a new client (server side)
  const client = stream.connect(
    process.env.API_KEY,
    process.env.SECRET,
    process.env.APP_ID
  );
  if (updateActivity.getResetAt() < Date.now()) {
    updateActivity.setLimitRemaining(300);
  }
  if (updateActivity.getLimitRemaining() < 50) {
    console.log(`waiting for ${updateActivity.getResetAt() - Date.now()}ms`);
    await sleep(updateActivity.getResetAt() - Date.now());
  }
  updateActivity.setLimitRemaining(updateActivity.getLimitRemaining() - 1);

  return await callFn(
    () =>
      axios
        .post(
          `${client.getBaseUrl()}${client.version}/activity?api_key=${
            client.apiKey
          }`,
          {
            id,
            set,
          },
          {
            headers: {
              Authorization: `Bearer ${client.getOrCreateToken()}`,
            },
          }
        )
        .then((result) => {
          updateActivity.setLimitRemaining(
            +result.headers["x-ratelimit-remaining"]
          );
          updateActivity.setResetAt(
            +result.headers["x-ratelimit-reset"] * 1000
          );
        }),
    1000,
    2,
    5000
  );
};

module.exports = {
  putStream,
};
