// const stream = require("getstream");
// const streamChat = require("stream-chat");
const { convertString, capitalizing } = require("../utils/custom");

const StreamChat = require("stream-chat").StreamChat;

const addUserToChannel = async (job, done) => {
  try {
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

      let name = convertString(channelId, "-", " ");
      let channelName = capitalizing(name);

      const channel = serverClient.channel("messaging", channelId, {
        name: channelName,
        created_by_id: "system",
      });
      await channel.create();

      await channel.addMembers(members, {
        text: "A new user has joined the group.",
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
