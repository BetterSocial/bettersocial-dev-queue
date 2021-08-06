const { PostViewTime } = require("../databases/models");
const {
  followLocationService,
  followLocations,
  followUsers,
  followTopics,
} = require("../services");

const followLocation = async (job, done) => {
  try {
    console.info("running job follow location! with id " + job.id);
    /*
      @description job follow location to getstream
    */

    console.log(job.data);

    let { token, locations } = job.data;

    let res = await followLocationService(token, location);
    console.log(res);

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
    let { token, users } = job.data;
    let res = await followUsers(token, users);
    console.log(res);

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
    console.log(job.data);

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
