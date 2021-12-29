
const { generateRandomId } = require('../../utils');
const StreamChat = require("stream-chat").StreamChat;
const UserService = require('../postgres/UserService');

module.exports = async (id, users) => {
  const serverClient = StreamChat.getInstance(
    process.env.API_KEY,
    process.env.SECRET
  );
  try {
    let userService = new UserService();
    let ownUser = await userService.getUserById(id);
    users.map(user => {
      let members = [user.user_id, id];
      const filter = { type: 'messaging', members: { $eq: members } };
      const sort = [{ last_message_at: -1 }];
      console.log(filter)
      const findChannels = await clientChat.queryChannels(filter, sort, {
        watch: true,
        state: true,
      });
      if (findChannels.length > 0) {
        console.log('channel sudah ada');
        return;
      }
      let generatedChannelId = generateRandomId();
      let memberWithRoles = [];

      memberWithRoles.push({
        user_id: id,
        channel_role: "channel_moderator",
      })

      memberWithRoles.push({
        user_id: user.user_id,
        channel_role: "channel_moderator",
      })

      let chat = serverClient.channel(
        'messaging',
        generatedChannelId,
        {
          name: channelName.join(', '),
          type_channel: 0,
        },
      )

      let status = await chat.create();
      await chat.addMembers(memberWithRoles);

      const text = `You started following ${user.username}. Send them a message now.`;
      const message = {
        text,
        user_id: id,
        silent: true
      };
      await chat.sendMessage(message)

      const text = `${ownUser.username} started following you. Send them a message now`;
      const message = {
        text,
        user_id: id,
        silent: true
      };
      await chat.sendMessage(message)
    })
    serverClient.disconnectUser();
  } catch (error) {
    serverClient.disconnectUser();
    console.log(error);
    throw error
  }
}