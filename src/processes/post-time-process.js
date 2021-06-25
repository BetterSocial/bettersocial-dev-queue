const { PostViewTime } = require("../databases/models");

const createPostTime = async (job, done) => {
    try {
        console.info('create post time job is working! with id ' + job.id);
        /*
          @description job save to table post time
        */
        const result = await PostViewTime.create(job.data);
        console.info(`created ${result}`);
        done(null, result);
    } catch (error) {
        done(null, error);
    }
}

module.exports = {
  createPostTime
};
