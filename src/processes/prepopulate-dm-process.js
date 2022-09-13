const prepopulated = require("../services/chat/prepopulated");
const UserService = require("../services/postgres/UserService");

const prepopulatedDm = async (job, done) => {

  try {
    console.info("running job prepopulated dm to channel ! with id " + job.id);
    let data = job.data;
    let { id, ids } = data;
    let userService = new UserService();
    let userAdmin = await userService.getUserAdmin(process.env.USERNAME_ADMIN);
    let idAdmin = userAdmin.user_id;
    ids = ids.filter((element, i, ids) => {
      return (element !== idAdmin);
    })
    ids.push(idAdmin);
    let users = await userService.getUsersByIds(ids)
    const pre = await prepopulated(id, users);
    done(null, pre);
  } catch (error) {
    console.error(error);
    done(null, error);
  }
}

module.exports = {
  prepopulatedDm
}