const handlerCompleted = job => {
  console.info(
    `Job in ${job.queue.name} completed for: ${JSON.stringify(job.data)}`
  );
  job.remove();
};

const handlerFailure = (job, err) => {
  if (job.attemptsMade >= job.opts.attempts) {
    console.info(
      `Job failures above threshold in ${job.queue.name} for: ${JSON.stringify(
        job.data
      )}`,
      err
    );
    job.remove();
    return null;
  }
  console.info(
    `Job in ${job.queue.name} failed for: ${JSON.stringify(job.data)} with ${err.message
    }. ${job.opts.attempts - job.attemptsMade} attempts left`
  );
};

const handlerStalled = job => {
  console.info(
    `Job in ${job.queue.name} stalled for: ${JSON.stringify(job.data)}`
  );
};

module.exports = {
  handlerCompleted, handlerFailure, handlerStalled
}
