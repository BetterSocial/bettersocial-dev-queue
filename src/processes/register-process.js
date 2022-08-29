const StreamChat = require("stream-chat").StreamChat;
const { convertString, capitalizing } = require("../utils/custom");
const {
    CHANNEL_TYPE_TOPIC,
    CHANNEL_TYPE_GROUP_LOCATION,
    ICON_TOPIC_CHANNEL,
    ICON_LOCATION_CHANNEL,
    PREFIX_TOPIC,
} = require("../utils/constant");
const prepopulated = require("../services/chat/prepopulated");
const UserService = require("../services/postgres/UserService");
const { followTopics, followUsers, followLocations } = require("../services");
const { LogError } = require('../databases/models');

const addUserToLocationChannel = async (userId, channelIds) => {
    try {
        const serverClient = StreamChat.getInstance(
            process.env.API_KEY,
            process.env.SECRET
        );
        channelIds.map(async (item) => {
            const token = serverClient.createToken(userId);
            const channelId = item;
            const members = [];
            members.push(userId);

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
                user_id: userId,
            });
        });
        console.info('addUser to channel: ', 'done');
    } catch (error) {
        console.log('error addUserToChannel: ', error);
    }
};

const addUserToTopicChannel = async (user_id, topics) => {
    try {
        let userId = user_id.toString();
        const serverClient = StreamChat.getInstance(
            process.env.API_KEY,
            process.env.SECRET
        );
        topics.map(async (item) => {
            const token = serverClient.createToken(userId);
            const channelId = PREFIX_TOPIC + item;
            const members = [];
            members.push(userId);

            let name = capitalizing(item);
            let channelName = "#" + convertString(name, "-", "");

            const channel = serverClient.channel("topics", channelId, {
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
                user_id: userId,
            });

        });
        console.log('addUserToTopicChannel', 'done');
    } catch (error) {
        await LogError.create({
            message: error.message
        })
        console.log('addUserToTopicChannel: ', error);
    }
};

const prepopulatedDm = async (id, ids) => {
    try {
        let userService = new UserService();
        let userAdmin = await userService.getUserAdmin(process.env.USERNAME_ADMIN);
        if (userAdmin) {
            let idAdmin = userAdmin.user_id;
            ids = ids.filter((element, i, ids) => {
                return (element !== idAdmin);
            })
            ids.push(idAdmin);
        }
        let users = await userService.getUsersByIds(ids)
        const pre = await prepopulated(id, users);
        console.log('prepopulatedDm', 'done');
    } catch (error) {
        await LogError.create({
            message: error.message
        })
        console.log('error prepopulatedDm: ', error);
    }
}


const followLocation = async (userId, locations) => {
    try {
        let res = await followLocations(userId, locations);
        console.log('followLocation', 'done');
    } catch (error) {
        await LogError.create({
            message: error.message
        })
        console.log('followLocation: ', error);
    }
};

const followUser = async (userId, users) => {
    try {
        let res = await followUsers(userId, users);
        let userService = new UserService();
        let userAdmin = await userService.getUserAdmin(process.env.USERNAME_ADMIN);
        let idAdmin = userAdmin.user_id;
        users = users.filter((element, i, users) => {
            return (element !== idAdmin);
        })
        users.push(idAdmin);
        let result = await userService.getUsersByIds(users);
        const pre = await prepopulated(id, result);
        console.log('followUser', 'done');
    } catch (error) {
        await LogError.create({
            message: error.message
        })
        console.log('followUser: ', error);
    }
};

const followTopic = async (userId, topics) => {
    try {
        let res = await followTopics(userId, topics);
        console.log('followTopic', 'done');
    } catch (error) {
        await LogError.create({
            message: error.message
        })
        console.log('followTopic: ', error);
    }
};


const registerProcess = async (job, done) => {
    try {
        console.info("running job register process ! with id " + job.id);
        let data = job.data;
        let { token,
            userId,
            locationsChannel,
            follows,
            topics,
            locations } = data;

        console.info('token: ', token);
        console.log('userId: ', userId);
        console.log('locationsChannel: ', locationsChannel);
        console.log('follows: ', follows);
        console.log('topics: ', topics);
        console.log('locations: ', locations);

        await prepopulatedDm(userId, follows);
        await addUserToLocationChannel(userId, locationsChannel);
        await addUserToTopicChannel(userId, topics);
        await followLocation(userId, locationsChannel);
        await followTopic(userId, topics);
        done(null, 'ok');
    } catch (error) {
        console.log(error);
        await LogError.create({
            message: error.message
        })
        done(null, error);
    }
}

module.exports = {
    registerProcess,
}