const { followUsers } = require("../../services");
const { LogError } = require('../../databases/models');

const followUser = async (userId, users) => {
    try {
        await followUsers(userId, users);
    } catch (error) {
        await LogError.create({
            message: error.message
        });
        console.error('followUser: ', error);
    }
};

module.exports = followUser
