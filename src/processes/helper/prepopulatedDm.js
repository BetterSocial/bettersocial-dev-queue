const prepopulated = require("../../services/chat/prepopulated");
const UserService = require("../../services/postgres/UserService");
const { LogError } = require('../../databases/models');

const prepopulatedDm = async (id, ids) => {
    try {
        let userService = new UserService();
        let userAdmin = await userService.getUserAdmin(process.env.USERNAME_ADMIN);
        if (userAdmin) {
            let idAdmin = userAdmin.user_id;
            ids = ids.filter((element, i, ids) => {
                return (element !== idAdmin);
            });
            ids.push(idAdmin);
        }
        let users = await userService.getUsersByIds(ids);
        console.log('users in prepopulatedDm:')
        console.log(users)
        await prepopulated(id, users);
    } catch (error) {
        await LogError.create({
            message: error.message
        });
        console.error('error prepopulatedDm: ', error);
    }
};

module.exports = prepopulatedDm
