const {Op} = require('sequelize');
const {UserTopic} = require('../databases/models');
const db = require('../databases/models');

const StreamChat = require('stream-chat').StreamChat;
require('dotenv').config();

const topicAutoMessageProcess = async () => {
  const serverClient = StreamChat.getInstance(process.env.API_KEY, process.env.SECRET);
  try {
    let comunity_message_format = await db.sequelize.query(
      `SELECT
        (created_at + interval '1d' * delay_time)::date as current_date,
        now()::date,
        community_message_format_id, user_id, topic_id, message, delay_time, created_at AS createdAt, updated_at AS updatedAt
      FROM community_message_format AS CommunityMessageFormat
      WHERE CommunityMessageFormat.status = '1'
      AND (created_at + interval '1d' * delay_time)::date = now()::date`
    );
    comunity_message_format = comunity_message_format[0];

    const topic_ids = comunity_message_format.map((item) => item.topic_id);

    const user_topics = await UserTopic.findAll({
      where: {
        topic_id: {
          [Op.in]: topic_ids
        },
        notify_user: true,
        is_anonymous: false
      }
    });

    await Promise.all([
      user_topics.forEach(async (user_topic) => {
        const message_format = await comunity_message_format.filter(
          (message_format) => message_format.topic_id === user_topic.topic_id
        );
        const senderUserId = message_format[0].user_id;
        const targetUserId = user_topic.user_id;

        let chat = serverClient.channel('messaging', {
          type_channel: 0,
          members: [senderUserId, targetUserId],
          created_by_id: senderUserId
        });
        await chat.create();

        const channelState = await chat.watch();

        if (channelState.messages.length === 0) {
          await chat.sendMessage({
            text: message_format[0].message,
            user_id: targetUserId
          });

          try {
            await chat.stopWatching();
          } catch (error) {
            console.log('::: Error on stopWatching :::', error);
          }
        }
      })
    ]);

    return comunity_message_format;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

module.exports = {
  topicAutoMessageProcess
};
