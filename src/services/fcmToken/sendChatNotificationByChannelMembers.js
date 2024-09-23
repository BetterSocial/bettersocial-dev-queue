const sendChatNotification = require('./sendChatNotification');

const sendChatNotificationByChannelMembers = async (
  channelMembers = [],
  payload = {},
  options = {}
) => {
  const deduplicatedChannelMembers = [...new Set(channelMembers)];

  deduplicatedChannelMembers.forEach((member) => {
    sendChatNotification(member, payload, options);
  });
};

module.exports = sendChatNotificationByChannelMembers;
