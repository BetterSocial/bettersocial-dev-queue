const { convertString, ICON_TOPIC_CHANNEL, CHANNEL_TYPE_TOPIC } = require('../../utils');
const { LogError } = require('../../databases/models');
const StreamChat = require("stream-chat").StreamChat;

const addUserToTopicChannel = async (user_id, topics) => {
    try {
        let userId = user_id.toString();
        const serverClient = StreamChat.getInstance(
            process.env.API_KEY,
            process.env.SECRET
        );
        topics.map(async (item) => {
            serverClient.createToken(userId);
            const channelId = item;
            const members = [];
            members.push(userId);

            let channelName = "#" + convertString(item, "-", "");

            const channel = serverClient.channel("topics", channelId, {
                name: channelName,
                created_by_id: "system",
                channel_type: CHANNEL_TYPE_TOPIC,
                channelImage: ICON_TOPIC_CHANNEL,
                channel_image: ICON_TOPIC_CHANNEL,
                image: ICON_TOPIC_CHANNEL
            });
            await channel.create();

            await channel.addMembers(members);

        });
    } catch (error) {
        await LogError.create({
            message: error.message
        });
        console.error('addUserToTopicChannel: ', error);
    }
};

module.exports = addUserToTopicChannel