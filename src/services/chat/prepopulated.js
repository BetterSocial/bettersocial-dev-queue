const {StreamChat} = require('stream-chat');
const {generateRandomId} = require('../../utils');
const UserService = require('../postgres/UserService');
const {LogError} = require('../../databases/models');

module.exports = async (id, users) => {
  const serverClient = StreamChat.getInstance(process.env.API_KEY, process.env.SECRET);

  console.log('prepopulated child function is called');
  try {
    const userService = new UserService();
    const ownUser = await userService.getUserById(id);

    const res = await Promise.all(
      users.map(async (user) => {
        const channelName = [];
        channelName.push(user.username);
        channelName.push(ownUser.username);
        const generatedChannelId = generateRandomId();

        const chat = serverClient.channel('messaging', {
          name: channelName.join(', '),
          type_channel: 0,
          members: [id, user?.user_id],
          created_by_id: id
        });

        const status = await chat.create();
        /**
         * usup mengikuti fajar
         * jadi ketika mengikuti fajar
         * message You started following fajar. Send them a message now.
         * hanya tampil untuk user usup saja
         * sedangkan untuk
         * Usup started following you. send them a message now
         * boleh tampil kecuali untuk user usup
         */

        await chat.updatePartial({
          set: {
            better_channel_member: [
              {
                user: {
                  updated_at: ownUser?.updated_at,
                  is_anonymous: ownUser?.is_anonymous,
                  name: ownUser?.username,
                  image: ownUser?.profile_pic_path,
                  last_active: ownUser?.last_active_at,
                  username: ownUser?.username,
                  id: ownUser?.user_id,
                  created_at: ownUser?.created_at
                },
                user_id: ownUser?.user_id,
                is_anonymous: false,
                updated_at: new Date().toISOString()
              },
              {
                user: {
                  updated_at: user?.updated_at,
                  is_anonymous: user?.is_anonymous,
                  name: user?.username,
                  image: user?.profile_pic_path,
                  last_active: user?.last_active_at,
                  username: user?.username,
                  id: user?.user_id,
                  created_at: user?.created_at
                },
                user_id: user?.user_id,
                is_anonymous: false,
                updated_at: new Date().toISOString()
              }
            ]
          }
        });

        const textTargetUser = `${ownUser.username} started following you. Send them a message now`;
        const textOwnUser = `You started following ${user.username}. Send them a message now.`;
        await chat.sendMessage(
          {
            user_id: id,
            text: textTargetUser,
            only_to_user_show: id,
            disable_to_user: false,
            is_from_prepopulated: true,
            other_text: textTargetUser,
            own_text: textOwnUser,
            system_user: id,
            isSystem: true,
            type: 'system'
          },
          {
            skip_push: true
          }
        );

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
