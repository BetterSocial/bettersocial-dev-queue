const StreamChat = require("stream-chat").StreamChat;
const { convertString, capitalizing, convertingUserFormatForLocation } = require("../utils/custom");
const {
    CHANNEL_TYPE_TOPIC,
    CHANNEL_TYPE_GROUP_LOCATION,
    ICON_TOPIC_CHANNEL,
    ICON_LOCATION_CHANNEL,
    PREFIX_TOPIC,
} = require("../utils/constant");
const prepopulated = require("../services/chat/prepopulated");
const UserService = require("../services/postgres/UserService");
const { followTopics, followUsers, followLocations, makeTargetsFollowMyAnonymousUser } = require("../services");
const { LogError } = require('../databases/models');
const UserLocationFunction = require("../databases/functions/userLocation");
const UserTopicFunction = require("../databases/functions/userTopic");
const UserFollowUserFunction = require("../databases/functions/userFollowUser");

const {
    sequelize,
    Locations,
    Topics,
    UserFollowUser,
    UserFollowUserHistory,
    UserLocationHistory,
    UserLocation,
    UserTopic,
    UserTopicHistory } = require("../databases/models");
const LocationFunction = require("../databases/functions/location");
const TopicFunction = require("../databases/functions/topics");

const addUserToLocationChannel = async (userId, channelIds) => {
    try {
        const serverClient = StreamChat.getInstance(
            process.env.API_KEY,
            process.env.SECRET
        );
        channelIds.map(async (item) => {
            serverClient.createToken(userId);
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
            await channel.addMembers(members);
        });
        console.info('addUser to channel: ', 'done');
    } catch (error) {
        console.error('error addUserToChannel: ', error);
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
            serverClient.createToken(userId);
            const channelId = item;
            const members = [];
            members.push(userId);

            let channelName = "#" + convertString(item, "-", "");

            const channel = serverClient.channel("topics", channelId, {
                name: channelName,
                created_by_id: "system",
                channel_type: CHANNEL_TYPE_TOPIC,
                channelImage: ICON_TOPIC_CHANNEL,
                channel_image: ICON_TOPIC_CHANNEL,
                image: ICON_TOPIC_CHANNEL
            });
            await channel.create();

            await channel.addMembers(members);

        });
    } catch (error) {
        await LogError.create({
            message: error.message
        })
        console.error('addUserToTopicChannel: ', error);
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
        await prepopulated(id, users);
    } catch (error) {
        await LogError.create({
            message: error.message
        })
        console.error('error prepopulatedDm: ', error);
    }
}


const followLocation = async (userId, locations) => {
    try {
        await followLocations(userId, locations);
    } catch (error) {
        await LogError.create({
            message: error.message
        })
        console.error('followLocation: ', error);
    }
};

const followUser = async (userId, users) => {
    try {
        await followUsers(userId, users);
        let userService = new UserService();
        let userAdmin = await userService.getUserAdmin(process.env.USERNAME_ADMIN);
        let idAdmin = userAdmin.user_id;
        users = users.filter((element, i, users) => {
            return (element !== idAdmin);
        })
        users.push(idAdmin);
        let result = await userService.getUsersByIds(users);
        await prepopulated(userId, result);
    } catch (error) {
        await LogError.create({
            message: error.message
        })
        console.error('followUser: ', error);
    }
};

const followAnonymousUser = async (myAnonUserId, targets) => {
    try {
        await makeTargetsFollowMyAnonymousUser(myAnonUserId, targets);
    } catch (error) {
        await LogError.create({
            message: error.message
        })
        console.error('followUser: ', error);
    }
};

const followTopic = async (userId, topics) => {
    try {
        await followTopics(userId, topics);
    } catch (error) {
        await LogError.create({
            message: error.message
        })
        console.error('followTopic: ', error);
    }
};


const registerProcess = async (job, done) => {
    try {
        console.info("running job register process ! with id " + job.id);
        let data = job.data;
        let { userId,
            follows,
            topics,
            anonUserId,
            locations } = data;

        const result = await sequelize.transaction(async (t) => {
            const locationIds = locations.map((item) => item?.location_id);
            await UserLocationFunction.registerUserLocation(
                UserLocation,
                UserLocationHistory,
                userId,
                locationIds,
                t
            );

            const topicToRegistered = await TopicFunction.findAllByTopicNames(
                Topics, 
                topics, 
                t, 
                true
            );


            const topicNames = topicToRegistered.map((item) => item?.topic_id);
            await UserTopicFunction.registerUserTopic(
                UserTopic,
                UserTopicHistory,
                userId,
                topicNames,
                t
            )

            await UserFollowUserFunction.registerAddFollowUser(
                UserFollowUser,
                UserFollowUserHistory,
                userId,
                follows,
                'onboarding',
                t
            )

            const locationResult = await LocationFunction.findAllLocationByLocationIds(
                Locations,
                locationIds,
                t,
                true
            )
            
            return {
                locations: convertingUserFormatForLocation(locationResult)
            }
        });



        await followUser(userId, follows);
        await followAnonymousUser(anonUserId, follows);
        await prepopulatedDm(userId, follows);
        await addUserToLocationChannel(userId, result?.locations);
        await addUserToTopicChannel(userId, topics);
        await followLocation(userId, result?.locations);
        await followTopic(userId, topics);
        await LogError.create({
            message: `done register process userId: ${userId}`
        })
        done(null, 'ok');
    } catch (error) {
        console.error(error);
        await LogError.create({
            message: error.message
        })
        done(null, error);
    }
}

module.exports = {
    registerProcess,
    addUserToTopicChannel,
}