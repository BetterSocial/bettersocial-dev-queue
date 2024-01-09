const StreamChat = require('stream-chat').StreamChat;

const testMsgFormat = async (req, res) => {
  const serverClient = StreamChat.getInstance(process.env.API_KEY, process.env.SECRET);
  try {
    //const channelId = 'ccfb6161-77cf-4ff3-23b0-5e4eb4396252';
    const channelId = 'cd53c2e0-e21f-4b6f-161a-7ad54bdddd5b';

    const targetUserId = 'f871c9fd-ab79-41af-97df-d8f7fff44d0d';
    const targetUsername = 'Anonymous Kangaroo';

    const ownUserId = 'd7ed6c3d-a57e-46b8-b129-e56e5ba58e12';
    const ownUsername = 'fajarismv2';

    console.log('channelId');
    console.log(channelId);

    const channelName = [];
    channelName.push(targetUsername);
    channelName.push(ownUsername);

    let chat = serverClient.channel('messaging', channelId, {
      name: channelName.join(', '),
      type_channel: 0,
      created_by_id: ownUserId
    });
    await chat.create();

    const newOwnUser = ownUsername[0].toUpperCase() + ownUsername.slice(1);
    const toBeSent = {
      text: `Hi ${newOwnUser}\n\nWelcome to ${process.env.BRAND_NAME}.\nWe’re here to help you navigate the app. If you have any questions, ideas or criticism, feel free to message us.\nMessages will be replied by a mix of AI and human review, so we promise to get you a satisfying answer. Every ideas or feedback will be reviewed by our Product team!\nIn our mission to build a better, healthier social internet, we’re here to help, and to learn from you!\n\nAny questions to start with?`,
      mentioned_users: [ownUserId]
    };

    await chat.sendMessage({
      ...toBeSent,
      user_id: targetUserId
    });

    return res.json({
      status: 'ok',
      result: toBeSent
    });
  } catch (error) {
    console.error('error');
    console.error(error);
    return res.json({
      ststus: 'error',
      message: error
    });
  }
};

module.exports = {testMsgFormat};
