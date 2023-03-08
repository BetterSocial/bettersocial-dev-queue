const { followLocations } = require("../../services");
const { LogError } = require('../../databases/models');

const followLocation = async (userId, locations) => {
    try {
        await followLocations(userId, locations);
    } catch (error) {
        await LogError.create({
            message: error.message
        });
        console.error('followLocation: ', error);
    }
};

module.exports = followLocation;
