const StreamChat = require('stream-chat').StreamChat;

const automateWelcomeMsgProcess = async (job, done) => {
  const serverClient = StreamChat.getInstance(process.env.API_KEY, process.env.SECRET);
  try {
    if (process.env.AUTO_WLCM_MSG === 'true') {
      let data = job.data;

      const resultPrepopulated = data.resultPrepopulated[0];
      const channelId = resultPrepopulated.generatedChannelId;

      console.log('channelId');
      console.log(channelId);

      const channelName = [];
      channelName.push(resultPrepopulated.targetUser.username);
      channelName.push(resultPrepopulated.ownUser.username);

      let chat = serverClient.channel('messaging', channelId, {
        name: channelName.join(', '),
        type_channel: 0,
        created_by_id: resultPrepopulated.ownUser.user_id
      });
      await chat.create();

      const channelState = await chat.watch();

      // channelState.messages.length <= 2 mean only 2 message about admin follow the newUsers and newUsers following newUsers
      if (channelState.messages.length <= 2) {
        const toBeSent = {
          text: `Hi ${resultPrepopulated.ownUser.username}.\nThis is Bastian, Founder of Better Social (I’m not a bot, I promise!). Thanks for signing up as one of our first users, the team & I really appreciates your support and I hope you will give us a chance in our fight to improve the broken social media landscape.\nThis is an uphill battle against giant corporations – I would love to hear from you how we can improve this app, and what would make it more likely for you to recommend the app to your friends and start posting here.\nAny feedback & criticism, but also questions are very welcome, and I promise to personally respond!\nThank you so much!\nBastian`,
          mentioned_users: [resultPrepopulated.ownUser.user_id]
        };

        await chat.sendMessage({
          ...toBeSent,
          user_id: resultPrepopulated.targetUser.user_id
        });

        await chat.stopWatching();
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
