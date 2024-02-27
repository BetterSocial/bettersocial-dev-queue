const {CHANNEL_TYPE_STRING} = require('../../utils');
const {LogError} = require('../../databases/models');
const StreamChat = require('stream-chat').StreamChat;

const createEmptyChannel = async (userId, usersFollowed) => {
  try {
    const client = StreamChat.getInstance(process.env.API_KEY, process.env.SECRET);

    await Promise.all(
      usersFollowed.map(async (userFollowed) => {
        const members = [userId, userFollowed];
        const channel = await client.channel(CHANNEL_TYPE_STRING.CHAT, {
          members,
          created_by_id: userId
        });

        await channel.create();
      })
    );
  } catch (error) {
    await LogError.create({
      message: error.message
    });
    console.error('createEmptyChannel: ', error);
  }
};

module.exports = createEmptyChannel;
