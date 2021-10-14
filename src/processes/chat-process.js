// const stream = require("getstream");
// const streamChat = require("stream-chat");
const { convertString } = require("../utils/custom");

const StreamChat = require("stream-chat").StreamChat;

const addUserToChannel = async (job, done) => {
  try {
    console.log("****************=====================******************");
    console.info("running job add new user to channel " + job.id);
    console.log(job.data);
    let data = job.data;
    let { channelIds, user_id } = data;
    let userId = user_id.toString();
    const serverClient = StreamChat.getInstance(
      process.env.API_KEY,
      process.env.SECRET
    );
    channelIds.map(async (item) => {
      const token = serverClient.createToken(userId);
      const channelId = item;
      const members = [];
      members.push(user_id);

      let channelName = convertString(channelId, "-", " ");
      let newChannelName = channelName.toUpperCase();

      const channel = serverClient.channel("messaging", channelId, {
        name: newChannelName,
        created_by_id: "system",
      });
      await channel.create();

      await channel.addMembers(members, {
        text: "new users has joined the channel.",
        user_id: user_id,
      });
    });
    done(null, job.data);
  } catch (error) {
    console.log(error);
    done(null, error);
  }
};

module.exports = {
  addUserToChannel,
};
