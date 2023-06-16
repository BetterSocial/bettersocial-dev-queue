const topicService = require("../../services");
const { LogError } = require('../../databases/models');

const followMainFeedTopic = async (userId, topicNames) => {
    try {
        await topicService.followMainFeedTopic(userId, topicNames);
    } catch (error) {
        await LogError.create({
            message: error.message
        });
        console.error('followMainFeedTopic: ', error);
    }
};

module.exports = followMainFeedTopic;
