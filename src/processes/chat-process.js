// const stream = require("getstream");
// const streamChat = require("stream-chat");
const { convertString, capitalizing } = require("../utils/custom");
const {
  CHANNEL_TYPE_TOPIC,
  CHANNEL_TYPE_GROUP_LOCATION,
  ICON_TOPIC_CHANNEL,
  ICON_LOCATION_CHANNEL,
} = require("../utils/constant");

const StreamChat = require("stream-chat").StreamChat;

const addUserToChannel = async (job, done) => {
  try {
    console.info("running job add user to channel ! with id " + job.id);
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
        channel_type: CHANNEL_TYPE_GROUP_LOCATION,
        channelImage: ICON_LOCATION_CHANNEL,
        channel_image: ICON_LOCATION_CHANNEL,
        image: ICON_LOCATION_CHANNEL
      });
      await channel.create();

      await channel.addMembers(members, {
        text: "A new user has joined the group.",
        user_id: user_id,
      });
    });
    console.log("Selesai add user to channel");
    done(null, job.data);
  } catch (error) {
    console.log(error);
    done(null, error);
  }
};

const addUserToTopicChannel = (job, done) => {
  try {
    console.info("running job add user to Topic ! with id " + job.id);
    let data = job.data;
    let { channelIds, user_id } = data;
    let userId = user_id.toString();
    const serverClient = StreamChat.getInstance(
      process.env.API_KEY,
      process.env.SECRET
    );
    channelIds.map(async (item) => {
      const token = serverClient.createToken(userId);
      const channelId = "topic_" + item;
      const members = [];
      members.push(user_id);

      let name = capitalizing(item);
      let channelName = "#" + convertString(name, "-", "");
      console.log(`Channel name: ${channelName}`);
      console.log(`Channel id: ${channelId}`);

      const channel = serverClient.channel("messaging", channelId, {
        name: channelName,
        created_by_id: "system",
        channel_type: CHANNEL_TYPE_TOPIC,
        channelImage: ICON_TOPIC_CHANNEL,
        channel_image: ICON_TOPIC_CHANNEL,
        image: ICON_TOPIC_CHANNEL
      });
      await channel.create();

      await channel.addMembers(members, {
        text: "A new user has joined the group.",
        user_id: user_id,
      });
    });
    console.log("finish handle add user ke topic chat");
    done(null, job.data);
  } catch (error) {
    console.log("addUserToTopicChannel");
    console.log(error);
    done(null, error);
  }
};

module.exports = {
  addUserToChannel,
  addUserToTopicChannel,
};
