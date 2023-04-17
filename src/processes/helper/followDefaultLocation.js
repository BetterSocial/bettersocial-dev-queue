const { followDefaultLocation } = require("../../services");
const { LogError } = require('../../databases/models');

const followDefaultLocationHelper = async (userId) => {
    try {
        await followDefaultLocation(userId);
    } catch (error) {
        await LogError.create({
            message: error.message
        });
        console.error('followDefaultLocation: ', error);
    }
};

module.exports = followDefaultLocationHelper;
