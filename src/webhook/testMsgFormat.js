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

    const toBeSent = {
      text: `Hi **${ownUsername}**.
      This is Bastian, Founder of Better Social (I’m not a bot, I promise!). Thanks for signing up as one of our first users, the team & I really appreciates your support and I hope you will give us a chance in our fight to improve the broken social media landscape.
      This is an uphill battle against giant corporations – I would love to hear from you how we can improve this app, and what would make it more likely for you to recommend the app to your friends and start posting here.
      Any feedback & criticism, but also questions are very welcome, and I promise to personally respond!
      Thank you so much!
      Bastian`,
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
