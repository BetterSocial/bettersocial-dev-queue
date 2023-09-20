const {generateRandomId} = require('../../utils');
const StreamChat = require('stream-chat').StreamChat;
const UserService = require('../postgres/UserService');
const {LogError} = require('../../databases/models');

module.exports = async (id, users) => {
  const serverClient = StreamChat.getInstance(process.env.API_KEY, process.env.SECRET);

  console.log('prepopulated child function is called');
  try {
    let userService = new UserService();
    let ownUser = await userService.getUserById(id);

    let res = await Promise.all(
      users.map(async (user) => {
        const channelName = [];
        channelName.push(user.username);
        channelName.push(ownUser.username);
        let generatedChannelId = generateRandomId();
        console.log('generatedChannelId');
        console.log(generatedChannelId);

        let chat = serverClient.channel('messaging', generatedChannelId, {
          name: channelName.join(', '),
          type_channel: 0,
          created_by_id: ownUser.user_id
        });

        let status = await chat.create();
        /**
         * usup mengikuti fajar
         * jadi ketika mengikuti fajar
         * message You started following fajar. Send them a message now.
         * hanya tampil untuk user usup saja
         * sedangkan untuk
         * Usup started following you. send them a message now
         * boleh tampil kecuali untuk user usup
         */

        const textTargetUser = `${ownUser.username} started following you. Send them a message now`;
        const textOwnUser = `You started following ${user.username}. Send them a message now.`;
        await chat.addMembers([id], {
          text: textOwnUser,
          user_id: id,
          only_to_user_show: id,
          disable_to_user: false,
          channel_role: 'channel_moderator',
          is_add: true,
          system_user: id,
          is_from_prepopulated: true,
          other_text: textTargetUser
        });
        await chat.addMembers([user.user_id], {
          text: textTargetUser,
          user_id: user.user_id,
          only_to_user_show: false,
          disable_to_user: id,
          channel_role: 'channel_moderator',
          is_add: false,
          system_user: id,
          is_from_prepopulated: true,
          other_text: textOwnUser
        });

        return {
          generatedChannelId,
          status,
          ownUser: {
            user_id: id,
            username: ownUser.username
          },
          targetUser: {
            user_id: user.user_id,
            username: user.username
          }
        };
      })
    );

    return res;
  } catch (error) {
    console.log(error);
    await LogError.create({
      message: error.message
    });
    throw error;
  }
};
