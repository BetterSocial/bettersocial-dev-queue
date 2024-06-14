const {StreamChat} = require('stream-chat');

const automateWelcomeMsgProcess = async (job, done) => {
  const serverClient = StreamChat.getInstance(process.env.API_KEY, process.env.SECRET);
  try {
    if (process.env.AUTO_WLCM_MSG === 'true') {
      const {data} = job;

      const resultPrepopulated = data.resultPrepopulated[0];
      const channelId = resultPrepopulated?.status?.channel?.id;

      console.log('channelId');
      console.log(channelId);

      const channelName = [];
      channelName.push(resultPrepopulated.targetUser.username);
      channelName.push(resultPrepopulated.ownUser.username);

      const chat = serverClient.channel('messaging', channelId, {
        name: channelName.join(', '),
        type_channel: 0,
        members: [resultPrepopulated.targetUser.user_id, resultPrepopulated.ownUser.user_id],
        created_by_id: resultPrepopulated.ownUser.user_id
      });
      await chat.create();

      const channelState = await chat.watch();
      // channelState.messages.length <= 2 mean only 2 message about admin follow the newUsers and newUsers following newUsers
      if (channelState.messages.length <= 2) {
        const newOwnUser =
          resultPrepopulated.ownUser.username[0].toUpperCase() +
          resultPrepopulated.ownUser.username.slice(1);
        // const toBeSent = {
        //   text: `Hi ${newOwnUser}\n\nWelcome to ${process.env.BRAND_NAME}.\nWe’re here to help you navigate the app. If you have any questions, ideas or criticism, feel free to message us.\nMessages will be replied by a mix of AI and human review, so we promise to get you a satisfying answer. Every ideas or feedback will be reviewed by our Product team!\nIn our mission to build a better, healthier social internet, we’re here to help, and to learn from you!\n\nAny questions to start with?`
        // };

        const toBeSent = {
          text: `Hi ${newOwnUser},\nWelcome to ${process.env.BRAND_NAME}! 🎉\n\nGot questions, ideas, or feedback? Share away! We’re all ears. Your input fuels our mission to make the internet a healthier, happier place.\n\nReady to dive in? Let’s chat! 🚀`
        };

        await chat.sendMessage({
          ...toBeSent,
          user_id: resultPrepopulated.targetUser.user_id
        });

        try {
          await chat.stopWatching();
        } catch (error) {
          console.log('::: Error on stopWatching :::', error);
        }
      }

      done(null, 'success running auto welcome msg');
    } else {
      done(null, 'auto welcome message is inactive');
    }
  } catch (error) {
    console.error(error);
    done(null, error);
  }
};

module.exports = {
  automateWelcomeMsgProcess
};
