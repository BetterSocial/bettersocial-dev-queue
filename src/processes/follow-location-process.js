const { PostViewTime } = require("../databases/models");
const { followLocations, followUsers, followTopics } = require("../services");
const prepopulated = require("../services/chat/prepopulated");
const UserService = require("../services/postgres/UserService");

const followLocation = async (job, done) => {
  try {
    console.info("running job follow location! with id " + job.id);
    /*
      @description job follow location to getstream
    */

    let { token, locations } = job.data;

    let res = await followLocations(token, location);
    done(null, job.data);
  } catch (error) {
    done(null, error);
  }
};

const followUser = async (job, done) => {
  try {
    console.info("running job follow user! with id " + job.id);
    /*
      @description job follow user to getstream
    */
    let { token, users, id } = job.data;
    let res = await followUsers(token, users);

    let userService = new UserService();
    let userAdmin = await userService.getUserAdmin(process.env.USERNAME_ADMIN);
    let idAdmin = userAdmin.user_id;
    users = users.filter((element, i, users) => {
      return (element !== idAdmin);
    })
    users.push(idAdmin);
    let result = await userService.getUsersByIds(users);
    const pre = await prepopulated(id, result);

    done(null, job.data);
  } catch (error) {
    done(null, error);
  }
};

const followTopic = async (job, done) => {
  try {
    console.info("running job follow topic! with id " + job.id);
    /*
      @description job follow user to getstream
      here logic to follow topic
    */
    let { token, topics } = job.data;
    let res = await followTopics(token, topics);

    done(null, job.data);
  } catch (error) {
    done(null, error);
  }
};

module.exports = {
  followLocation,
  followUser,
  followTopic,
};
