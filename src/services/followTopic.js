const stream = require("getstream");
const followTopic = async (token, userId) => {
    let id = userId.toLowerCase();
    const client = stream.connect(process.env.API_KEY, token, process.env.APP_ID);
    const user = client.feed("main_feed", client.userId, token);
    return user.follow("topic", id);
};

const followTopics = async (userId, userIds) => {
    const clientServer = stream.connect(process.env.API_KEY, process.env.SECRET);
    const follows = [];
    userIds.map((item) => {
        follows.push({
            source: "main_feed:" + userId,
            target: "topic:" + item?.name,
        });
    });

    return await clientServer.followMany(follows);
};

const followMainFeedTopic = async(userId, topicNames) => {
    const clientServer = stream.connect(process.env.API_KEY, process.env.SECRET);
    const follows = topicNames.map((name) => {
        return {
            source: "main_feed_topic:" + userId,
            target: "topic:" + name,
        }
    });

    return await clientServer.followMany(follows);
}

module.exports = {
    followTopic,
    followTopics,
    followMainFeedTopic
};
