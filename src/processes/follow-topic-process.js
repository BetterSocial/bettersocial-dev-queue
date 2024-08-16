const StreamChat = require('stream-chat').StreamChat;
const crypto = require('crypto');
const {
  LogError,
  UserTopic,
  User,
  CommunityMessageFormat,
  ChatAnonUserInfo
} = require('../databases/models');
const BetterSocialConstantListUtils = require('../utils/constantList/utils');
const CHANNEL_TYPE_ANONYMOUS = require('../utils/constant');
const updateBetterChannelMembers = require('../getstream/updateBetterChannelMembers');

const generate_channel_id_for_anon_chat = (owner, member, context = null, source_id = null) => {
  const hash = crypto.createHash('sha256');
  hash.update(owner);
  hash.update(member);
  if (context) hash.update(context);
  if (source_id) hash.update(source_id);

  return hash.digest('hex');
};
const anon_to_sign_user = async (client, user, targetUser) => {
  const channel = await ChatAnonUserInfo.findOne({
    where: {
      my_anon_user_id: user,
      target_user_id: targetUser,
      context: 'auto message',
      initiator: user
    }
  });
  if (channel) {
    return channel;
  } else {
    const channel_id = generate_channel_id_for_anon_chat(user, targetUser, 'autoMessage');
    const emoji = BetterSocialConstantListUtils.getRandomEmoji();
    const color = BetterSocialConstantListUtils.getRandomColor();
    const anon_init_data = {
      anon_user_info_color_code: color.code,
      anon_user_info_color_name: color.color,
      anon_user_info_emoji_code: emoji.emoji,
      anon_user_info_emoji_name: emoji.name
    };

    const new_channel = await ChatAnonUserInfo.create({
      channel_id: channel_id,
      my_anon_user_id: user,
      target_user_id: targetUser,
      anon_user_info_color_code: anon_init_data.anon_user_info_color_code,
      anon_user_info_color_name: anon_init_data.anon_user_info_color_name,
      anon_user_info_emoji_code: anon_init_data.anon_user_info_emoji_code,
      anon_user_info_emoji_name: anon_init_data.anon_user_info_emoji_name,
      context: 'auto message',
      initiator: user,
      source_id: ''
    });
    return new_channel;
  }
};
const sendMessageAsAnonymous = async (serverClient, communityMessageFormat, data) => {
  const members = [communityMessageFormat.user_id, data.user_id];
  const channel_info = await anon_to_sign_user(
    serverClient,
    communityMessageFormat.user_id,
    data.user_id
  );

  const newChannel = serverClient.channel('messaging', channel_info.channel_id, {
    type_channel: CHANNEL_TYPE_ANONYMOUS,
    members,
    created_by_id: communityMessageFormat.user_id
  });
  const createdChannel = await newChannel.create();
  const channelState = await newChannel.watch();

  await updateBetterChannelMembers(newChannel, createdChannel, true, {
    channel_type: CHANNEL_TYPE_ANONYMOUS
  });

  if (channelState.messages.length === 0) {
    await newChannel.sendMessage({
      text: communityMessageFormat.message,
      user_id: communityMessageFormat.user_id
    });

    try {
      // await chat.stopWatching();
    } catch (error) {
      console.log('::: Error on stopWatching :::', error);
    }
  }
};
const followTopicProcess = async (job, done) => {
  try {
    console.info(`running job register process ! with id ${job.id}`);
    const serverClient = StreamChat.getInstance(process.env.API_KEY, process.env.SECRET);
    if (process.env.AUTO_WLCM_MSG === 'true') {
      const {data} = job;
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

      // check if user is anonymous
      const senderUser = await User.findByPk(communityMessageFormat.user_id);
      if (senderUser.is_anonymous) {
        await sendMessageAsAnonymous(serverClient, communityMessageFormat, data);
      } else {
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
            user_id: communityMessageFormat.user_id,
            is_auto_message: true
          });

          try {
            // await chat.stopWatching();
          } catch (error) {
            console.log('::: Error on stopWatching :::', error);
          }
        } else if (
          channelState.messages.length === 1 &&
          channelState.messages[0]?.is_auto_message
        ) {
          // add new condition based on ticket ping-4227
          // check if first message is auto message from sender
          await chat.sendMessage({
            text: communityMessageFormat.message,
            user_id: communityMessageFormat.user_id
          });
        } else {
          console.log(':::  Channel not eligible to receive auto message :::');
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
