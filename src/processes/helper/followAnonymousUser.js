const { makeTargetsFollowMyAnonymousUser } = require("../../services");
const { LogError } = require('../../databases/models');

const followAnonymousUser = async (myAnonUserId, targets) => {
    try {
        await makeTargetsFollowMyAnonymousUser(myAnonUserId, targets);
    } catch (error) {
        await LogError.create({
            message: error.message
        });
        console.error('followUser: ', error);
    }
};

module.exports = followAnonymousUser;
