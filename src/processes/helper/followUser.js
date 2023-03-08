const prepopulated = require("../../services/chat/prepopulated");
const UserService = require("../../services/postgres/UserService");
const { followUsers } = require("../../services");
const { LogError } = require('../../databases/models');

const followUser = async (userId, users) => {
    try {
        await followUsers(userId, users);
        let userService = new UserService();
        let userAdmin = await userService.getUserAdmin(process.env.USERNAME_ADMIN);
        let idAdmin = userAdmin.user_id;
        users = users.filter((element, i, users) => {
            return (element !== idAdmin);
        });
        users.push(idAdmin);
        let result = await userService.getUsersByIds(users);
        await prepopulated(userId, result);
    } catch (error) {
        await LogError.create({
            message: error.message
        });
        console.error('followUser: ', error);
    }
};

module.exports = followUser
