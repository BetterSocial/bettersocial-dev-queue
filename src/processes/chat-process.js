const addMemberToChannel = async (job, done) => {
  try {
    console.info("running job add member to channel " + job.id);
    console.log(job.data);
    done(null, job.data);
  } catch (error) {
    done(null, error);
  }
};

module.exports = {
  addMemberToChannel,
};
