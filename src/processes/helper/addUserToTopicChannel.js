const {convertString, ICON_TOPIC_CHANNEL, CHANNEL_TYPE_TOPIC} = require('../../utils');
const {LogError} = require('../../databases/models');
const StreamChat = require('stream-chat').StreamChat;

const addUserToTopicChannel = async (user_id, topics) => {
  try {
    let userId = user_id.toString();
    const serverClient = StreamChat.getInstance(process.env.API_KEY, process.env.SECRET);
    topics.map(async (topic) => {
      const newTopic = convertString(topic, '-', '').toLowerCase();
      const token = serverClient.createToken(userId);

      await serverClient.connectUser({id: userId}, token);
      const members = [];
      members.push(userId);

      const channel = serverClient.channel('topics', `topic_${newTopic}`, {
        name: `#${newTopic}`,
        channel_type: CHANNEL_TYPE_TOPIC,
        channelImage: ICON_TOPIC_CHANNEL,
        channel_image: ICON_TOPIC_CHANNEL,
        image: ICON_TOPIC_CHANNEL
      });
      await channel.create();

      await channel.addMembers(members);
      await channel.sendMessage({text: 'This topic has new followers'}, {skip_push: true});
      console.log('channel followed');
      serverClient.disconnect();
    });
  } catch (error) {
    await LogError.create({
      message: error.message
    });
    console.error('addUserToTopicChannel: ', error);
  }
};

module.exports = addUserToTopicChannel;
