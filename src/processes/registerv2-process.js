const { convertingUserFormatForLocation } = require("../utils/custom");

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
const { followUser, followAnonymousUser, prepopulatedDm, addUserToLocationChannel, addUserToTopicChannel, followLocation, followTopic } = require("./helper");
const ProcessHelper = require("./helper");

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

        await ProcessHelper.followUser(userId, follows);
        await ProcessHelper.followAnonymousUser(anonUserId, follows);
        await ProcessHelper.prepopulatedDm(userId, follows);
        await ProcessHelper.addUserToLocationChannel(userId, result?.locations);
        await ProcessHelper.addUserToTopicChannel(userId, topics);
        await ProcessHelper.followLocation(userId, result?.locations);
        await ProcessHelper.followTopic(userId, topics);
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