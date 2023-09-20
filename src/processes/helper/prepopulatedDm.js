const prepopulated = require('../../services/chat/prepopulated');
const UserService = require('../../services/postgres/UserService');
const {LogError} = require('../../databases/models');

const prepopulatedDm = async (id, ids) => {
  try {
    let userService = new UserService();
    let userAdmin = await userService.getUserAdmin(process.env.USERNAME_ADMIN);
    let idAdmin;
    if (userAdmin) {
      idAdmin = userAdmin.user_id;
      ids = ids.filter((element, i, ids) => {
        return element !== idAdmin;
      });
      ids.push(idAdmin);
    }
    let users = await userService.getUsersByIds(ids);
    const resultPrepopulated = await prepopulated(id, users);
    return {id, idAdmin, resultPrepopulated};
  } catch (error) {
    await LogError.create({
      message: error.message
    });
    console.error('error prepopulatedDm: ', error);
  }
};

module.exports = prepopulatedDm;
