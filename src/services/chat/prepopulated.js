
const { generateRandomId } = require('../../utils');
const StreamChat = require("stream-chat").StreamChat;
const UserService = require('../postgres/UserService');
const { LogError } = require('../../databases/models');

module.exports = async (id, users) => {
    const serverClient = StreamChat.getInstance(
        process.env.API_KEY,
        process.env.SECRET
    );
    try {
        let userService = new UserService();
        console.log('id user register', id);
        let ownUser = await userService.getUserById(id);
        console.log('user register: ', ownUser);
        users.push(ownUser)
        let res = await users.map(async user => {
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
            /**
             * usup mengikuti fajar
             * jadi ketika mengikuti fajar
             * message You started following fajar. Send them a message now.
             * hanya tampil untuk user usup saja
             * sedangkan untuk
             * Usup started following you. send them a message now
             * boleh tampil kecuali untuk user usup
             */

            const textOwnUser = `You started following ${user.username}. Send them a message now.`;
            // await chat.addMembers([id], {
            //     text: textOwnUser,
            //     user_id: id,
            //     // only_to_user_show: id,
            //     // disable_to_user: false,
            //     // channel_role: "channel_moderator",
            //     // is_add: true,
            // });

            const textTargetUser = `${ownUser.username} started following you. Send them a message now`;
            await chat.addMembers([user.user_id, id], {
                text: user.user_id === id ? textOwnUser : textTargetUser,
                user_id: user.user_id,
                // only_to_user_show: false,
                // disable_to_user: id,
                // channel_role: "channel_moderator",
                // is_add: true
            });
            return status;
        });

        return res;
    } catch (error) {
        console.log(error);
        await LogError.create({
            message: error.message
        })
        throw error
    }
}