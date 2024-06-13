const _ = require('lodash');
const {Sequelize} = require('sequelize');
const {sequelize} = require('../databases/models');
const BetterSocialConstantListUtils = require('../utils/constantList/utils');

const SEPARATOR = ', ';

const getAllChatAnonimityUserInfo = async (channelId, userIds = []) => {
  if (!channelId) throw new Error('Channel ID is required');

  if (userIds?.length === 0) return [];
  const query = `
    SELECT
        users.user_id,
        users.username,
        users.is_anonymous,
        chat_anon_user_info.*
    FROM users
    LEFT JOIN chat_anon_user_info
        ON users.user_id = CAST(chat_anon_user_info.my_anon_user_id as varchar)
        AND chat_anon_user_info.channel_id = :channelId
    WHERE users.user_id IN (:userIds)`;

  try {
    const result = await sequelize.query(query, {
      replacements: {
        channelId,
        userIds
      },
      type: Sequelize.QueryTypes.SELECT
    });

    return result;
  } catch (e) {
    console.error('Failed to get chat anonimity user info', e);
    throw e;
  }
};

const __getAnonUserInfoPriority = (memberDataFromDb, member) => {
  if (memberDataFromDb.anon_user_info_color_code) {
    return {
      color_name: memberDataFromDb.anon_user_info_color_name,
      color_code: memberDataFromDb.anon_user_info_color_code,
      emoji_name: memberDataFromDb.anon_user_info_emoji_name,
      emoji_code: memberDataFromDb.anon_user_info_emoji_code
    };
  } else if (member.anon_user_info_color_code) {
    return {
      color_name: member.anon_user_info_color_name,
      color_code: member.anon_user_info_color_code,
      emoji_name: member.anon_user_info_emoji_name,
      emoji_code: member.anon_user_info_emoji_code
    };
  } else {
    const emoji = BetterSocialConstantListUtils.getRandomEmoji();
    const color = BetterSocialConstantListUtils.getRandomColor();
    return {
      color_name: color.color,
      color_code: color.code,
      emoji_name: emoji.name,
      emoji_code: emoji.emoji
    };
  }
};

const __helperProcessBetterChannelMember = (members, membersDataFromDbMap) => {
  let newChannelName = '';
  const better_channel_member = members.map((member) => {
    const memberDataFromDb = membersDataFromDbMap[member.user_id];

    if (!memberDataFromDb) return member;
    const {is_anonymous, username, anon_user_info_emoji_name, anon_user_info_color_name} =
      memberDataFromDb;

    const updatedUsername = is_anonymous
      ? `${anon_user_info_color_name} ${anon_user_info_emoji_name}`
      : username;

    newChannelName += `${updatedUsername}${SEPARATOR}`;

    const defaultUser = {
      ...member,
      is_anonymous,
      user: {
        ...member.user,
        is_anonymous: is_anonymous,
        username: updatedUsername,
        name: updatedUsername
      }
    };

    if (is_anonymous) {
      defaultUser.is_anonymous = is_anonymous;
      const anon_user_info = __getAnonUserInfoPriority(memberDataFromDb, member);
      defaultUser.anon_user_info_color_name = anon_user_info.color_name;
      defaultUser.anon_user_info_color_code = anon_user_info.color_code;
      defaultUser.anon_user_info_emoji_name = anon_user_info.emoji_name;
      defaultUser.anon_user_info_emoji_code = anon_user_info.emoji_code;
    }

    return defaultUser;
  });

  return {
    better_channel_member,
    new_channel_name: newChannelName.slice(0, -SEPARATOR.length)
  };
};

/**
 * @typedef {Object} UpdateBetterChannelMember
 * @property {import('stream-chat').ChannelMember[]} betterChannelMember
 * @property {string} newChannelName
 * @property {Object} betterChannelMemberObject
 * @property {import("stream-chat").ChannelAPIResponse} updatedChannel
 */

/**
 *
 * @param {import('stream-chat').Channel} chatChannel
 * @param {import("stream-chat").ChannelAPIResponse} channel
 * @param {Partial<import("stream-chat").ChannelResponse>} additionalUpdateData
 * @returns {Promise<UpdateBetterChannelMember>}
 */
const updateBetterChannelMembers = async (
  chatChannel,
  channel,
  withUpdate = false,
  additionalUpdateData = {}
) => {
  if (!chatChannel) throw new Error('Chat Channel is required');
  if (!channel) throw new Error('Channel is required');

  const {members} = channel;

  const membersIds = members.map((member) => member.user_id);

  const membersDataFromDb = await getAllChatAnonimityUserInfo(channel?.channel?.id, membersIds);

  const membersDataFromDbMap = _.keyBy(membersDataFromDb, 'user_id');

  const {better_channel_member, new_channel_name} = __helperProcessBetterChannelMember(
    members,
    membersDataFromDbMap
  );

  const checkedChannelName = channel?.channel?.is_name_custom
    ? channel?.channel?.name
    : new_channel_name;

  const defaultUpdateData = {
    better_channel_member,
    name: checkedChannelName,
    ...additionalUpdateData
  };

  if (withUpdate) {
    try {
      channel = await chatChannel.updatePartial({
        set: defaultUpdateData
      });
    } catch (e) {
      console.error('Failed to update channel', e);
    }
  }

  return {
    betterChannelMember: better_channel_member,
    newChannelName: checkedChannelName,
    betterChannelMemberObject: _.keyBy(better_channel_member, 'user_id'),
    updatedChannel: channel
  };
};

module.exports = updateBetterChannelMembers;
