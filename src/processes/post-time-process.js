const { PostViewTime } = require("../databases/models");

const createPostTime = async (job, done) => {
  try {
    console.info('running job create post time! with id ' + job.id);
    /*
      @description job save to table post time
    */
    await PostViewTime.create(job.data);
    done(null, job.data);
  } catch (error) {
    done(null, error);
  }
}

module.exports = {
  createPostTime
};
