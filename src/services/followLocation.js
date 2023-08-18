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

const followDefaultLocation = async(userId) => {
    const clientServer = stream.connect(process.env.API_KEY, process.env.SECRET);
    const follows = [];
    follows.push({
        source: "main_feed_following:" + userId,
        target: "location:everywhere",
    });
    return await clientServer.followMany(follows);
}

const followLocations = async (userId, locations) => {
    const clientServer = stream.connect(process.env.API_KEY, process.env.SECRET);
    const follows = [];
    /* istanbul ignore next */
    locations.map((item) => {
        follows.push({
            source: "main_feed_following:" + userId,
            target: "location:" + item,
        })
    });
    return await clientServer.followMany(follows);
};

module.exports = {
    followLocation,
    followLocations,
    followDefaultLocation,
};
