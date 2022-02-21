const stream = require("getstream");
const followLocation = async (token, userId) => {
  let id = userId.toLowerCase();
  const client = stream.connect(process.env.API_KEY, token, process.env.APP_ID);
  const user = client.feed("main_feed", client.userId, token);
  return user.follow("location", id);
};

/* istanbul ignore next */
const changeValue = (item) => {
  if (/\s/.test(item)) {
    return item.split(" ").join("-");
  }
  return item;
};

const followLocations = async (userId, locations) => {
  // const client = stream.connect(process.env.API_KEY, token, process.env.APP_ID);
  const clientServer = stream.connect(process.env.API_KEY, process.env.SECRET);
  const follows = [];
  follows.push({
    source: "main_feed:" + userId,
    target: "location:everywhere",
  });
  /* istanbul ignore next */
  locations.map((item) => {
    const neighborhood = follows.findIndex(
      (x) =>
        x.target === "location:" + changeValue(item.neighborhood.toLowerCase())
    );
    neighborhood === -1
      ? item.neighborhood !== ""
        ? follows.push({
          source: "main_feed:" + userId,
          target: "location:" + changeValue(item.neighborhood.toLowerCase()),
        })
        : null
      : null;
    const city = follows.findIndex(
      (x) => x.target === "location:" + changeValue(item.city.toLowerCase())
    );
    city === -1
      ? item.city !== ""
        ? follows.push({
          source: "main_feed:" + userId,
          target: "location:" + changeValue(item.city.toLowerCase()),
        })
        : null
      : null;

    const state = follows.findIndex(
      (x) => x.target === "location:" + changeValue(item.state.toLowerCase())
    );
    state === -1
      ? item.state !== ""
        ? follows.push({
          source: "main_feed:" + userId,
          target: "location:" + changeValue(item.state.toLowerCase()),
        })
        : null
      : null;
    const country = follows.findIndex(
      (x) => x.target === "location:" + changeValue(item.country.toLowerCase())
    );
    country === -1
      ? item.country !== null
        ? follows.push({
          source: "main_feed:" + userId,
          target: "location:" + changeValue(item.country.toLowerCase()),
        })
        : null
      : null;
  });
  return await clientServer.followMany(follows);
};

module.exports = {
  followLocation,
  followLocations,
};
