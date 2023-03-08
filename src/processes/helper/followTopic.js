const { followTopics } = require("../../services");
const { LogError } = require('../../databases/models');

const followTopic = async (userId, topics) => {
    try {
        await followTopics(userId, topics);
    } catch (error) {
        await LogError.create({
            message: error.message
        });
        console.error('followTopic: ', error);
    }
};

module.exports = followTopic;
