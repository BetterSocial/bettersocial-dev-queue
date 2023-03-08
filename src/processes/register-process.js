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
const { LogError, Locations } = require('../databases/models');
const { followUser, followAnonymousUser, prepopulatedDm, addUserToLocationChannel, addUserToTopicChannel, followLocation, followTopic } = require("./helper");
const LocationFunction = require("../databases/functions/location");

const registerProcess = async (job, done) => {
    try {
        console.info("running job register process ! with id " + job.id);
        let data = job.data;
        let { userId,
            follows,
            topics,
            anonUserId,
            locations } = data;

        const locationIds = locations.map((item) => item?.location_id);
        const locationResult = await LocationFunction.findAllLocationByLocationIds(
            Locations,
            locationIds,
            null,
            true
        )

        const location = convertingUserFormatForLocation(locationResult);

        await followUser(userId, follows);
        await followAnonymousUser(anonUserId, follows);
        await prepopulatedDm(userId, follows);
        await addUserToLocationChannel(userId, location);
        await addUserToTopicChannel(userId, topics);
        await followLocation(userId, location);
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