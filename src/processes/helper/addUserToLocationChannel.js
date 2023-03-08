const { convertString, capitalizing } = require("../../utils/custom");
const { CHANNEL_TYPE_GROUP_LOCATION, ICON_LOCATION_CHANNEL } = require("../../utils/constant");
const { StreamChat } = require("stream-chat");

const addUserToLocationChannel = async (userId, channelIds) => {
    try {
        const serverClient = StreamChat.getInstance(
            process.env.API_KEY,
            process.env.SECRET
        );
        channelIds.map(async (item) => {
            serverClient.createToken(userId);
            const channelId = item;
            const members = [];
            members.push(userId);

            let name = convertString(channelId, "-", " ");
            let channelName = capitalizing(name);

            const channel = serverClient.channel("messaging", channelId, {
                name: channelName,
                created_by_id: "system",
                channel_type: CHANNEL_TYPE_GROUP_LOCATION,
                channelImage: ICON_LOCATION_CHANNEL,
                channel_image: ICON_LOCATION_CHANNEL,
                image: ICON_LOCATION_CHANNEL
            });
            await channel.create();
            await channel.addMembers(members);
        });
        console.info('addUser to channel: ', 'done');
    } catch (error) {
        console.error('error addUserToChannel: ', error);
    }
};
module.exports = addUserToLocationChannel
