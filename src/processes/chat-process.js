// const stream = require("getstream");
// const streamChat = require("stream-chat");

const StreamChat = require("stream-chat").StreamChat;

const addMemberToChannel = async (job, done) => {
  try {
    console.info("running job add member to channel " + job.id);
    console.log(job.data);
    let data = job.data;
    let { locations, user_id } = data;
    let userId = user_id.toString();
    const serverClient = StreamChat.getInstance(
      process.env.API_KEY,
      process.env.SECRET
    );
    // const updateResponse = await serverClient.upsertUser({
    //   id: userID,
    //   role: "user",
    // });
    // console.log(updateResponse);
    locations.map(async (item) => {
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

    // you can still use new StreamChat('api_key', 'api_secret');

    // generate a token for the user with id 'john'

    // let members = users.map((item) => item.user_id);
    // members.push(myProfile.user_id);
    // let channelName = users.map((item) => {
    //   return item.username;
    // });
    // channelName.push(myProfile.username);
    // const client = await streamChat.StreamChat.getInstance(
    //   process.env.API_KEY,
    //   process.env.SECRET
    // );
    // console.log(client);
    // const client = stream.connect(process.env.API_KEY, process.env.SECRET);
    // const channelChat = await clientChat.channel("messaging", {
    //   name: channelName,
    //   members: members,
    // });
    // await channelChat.watch();
    done(null, job.data);
  } catch (error) {
    console.log(error);
    done(null, error);
  }
};

module.exports = {
  addMemberToChannel,
};
