// const stream = require("getstream");
// const streamChat = require("stream-chat");

const StreamChat = require("stream-chat").StreamChat;

const addUserToChannel = async (job, done) => {
  try {
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

      const channel = serverClient.channel("messaging", channelId, {
        name: `Awesome channel about ${channelId}`,
        created_by_id: "e554d0ac-81cc-4139-9939-11de565cda27",
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
