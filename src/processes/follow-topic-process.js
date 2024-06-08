const StreamChat = require('stream-chat').StreamChat;

const {LogError, UserTopic, CommunityMessageFormat} = require('../databases/models');

const followTopicProcess = async (job, done) => {
  try {
    console.info('running job register process ! with id ' + job.id);
    const serverClient = StreamChat.getInstance(process.env.API_KEY, process.env.SECRET);
    if (process.env.AUTO_WLCM_MSG === 'true') {
      let data = job.data;
      // check if user is following a topic
      const userTopic = await UserTopic.findOne({
        where: {
          topic_id: data.topic_id,
          user_id: data.user_id,
          is_anonymous: false
        }
      });
      if (!userTopic) {
        done(null, 'user is not following the topic');
        return;
      }
      // check if community message format is active
      const communityMessageFormat = await CommunityMessageFormat.findOne({
        where: {
          status: '1',
          community_message_format_id: data.community_message_format_id
        }
      });
      if (!communityMessageFormat) {
        done(null, 'community message format is inactive or not found');
        return;
      }
      // check user already received the message from admin
      const chat = serverClient.channel('messaging', {
        type_channel: 0,
        members: [communityMessageFormat.user_id, data.user_id],
        created_by_id: communityMessageFormat.user_id
      });
      await chat.create();

      const channelState = await chat.watch();

      if (channelState.messages.length === 0) {
        await chat.sendMessage({
          text: communityMessageFormat.message,
          user_id: data.user_id
        });

        try {
          // await chat.stopWatching();
        } catch (error) {
          console.log('::: Error on stopWatching :::', error);
        }
      }

      done(null, 'success running community auto message');
    } else {
      done(null, 'community auto message is inactive');
    }
  } catch (error) {
    console.error(error);
    await LogError.create({
      message: error.message
    });
    done(null, error);
  }
};

module.exports = {
  followTopicProcess
};
