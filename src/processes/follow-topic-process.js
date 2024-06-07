const {LogError} = require('../databases/models');
const {preTopicAutoMsgProcess} = require('./helper/preTopicAutoMsg');

const followTopicProcess = async (job, done) => {
  try {
    console.info('running job register process ! with id ' + job.id);
    let data = job.data;

    await preTopicAutoMsgProcess(data);

    done(null, 'ok');
  } catch (error) {
    console.error(error);
    await LogError.create({
      message: error.message
    });
    done(null, error);
  }
};

module.exports = {
  followTopicProcess
};
