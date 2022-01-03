
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
    await users.map(async user => {
      let members = [user.user_id, id];
      // const filter = { type: 'messaging', members: { $eq: members } };
      // const sort = [{ last_message_at: -1 }];
      // const findChannels = await serverClient.queryChannels(filter, sort, {
      //   watch: true,
      //   state: true,
      // });
      // if (findChannels.length > 0) {
      //   console.log('channel sudah ada');
      //   return;
      // }
      const channelName = [];
      channelName.push(user.username);
      channelName.push(ownUser.username);
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
          created_by_id: ownUser.user_id
        },
      )

      let status = await chat.create();

      const textOwnUser = `You started following ${user.username}. Send them a message now.`;
      await chat.addMembers([id], {
        text: textOwnUser, user_id: id,
        channel_role: "channel_moderator",
      });

      const textTargetUser = `${ownUser.username} started following you. Send them a message now`;
      await chat.addMembers([user.user_id], {
        text: textTargetUser,
        user_id: user.user_id,
        channel_role: "channel_moderator",
      });
      return status;
    })
  } catch (error) {
    console.log(error);
    throw error
  }
}