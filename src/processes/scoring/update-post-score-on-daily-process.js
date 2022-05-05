const moment = require("moment");
const { calcPostScore } = require("./calc-post-score");
const {
  REGULAR_TIME_FORMAT
} = require("../scoring-constant");

const scoringProcessQueue = require("../../queues/queueSenderForRedis"); // uncomment this line if using redis as message queue server
//const scoringProcessQueue = require("../../queues/queueSenderForKafka"); // uncomment this line if using kafka as message queue server

const updatePostScoreOnDailyProcess = async(
        job, postScoreCol, processTime, postIds, lastBatch) => {
  console.debug("Starting updatePostScoreOnDailyProcess");

  // get complete doc from the db, by given user ids
  const cursors = await postScoreCol.find({ "_id" : { $in: postIds } });

  // calculate percentage per document. It's going to be used for updating job's progress
  const progressPerDoc = Math.floor(100/postIds.length);
  let counter = 0;

  let postDoc;
  const updatedDocs = [];
  while (await cursors.hasNext()) {
    counter++;
    postDoc = await cursors.next();

    // set done final process flag, by looking at the expired time
    if (postDoc.expired_at != "" &&
      moment().utc().diff(moment(postDoc.expired_at, REGULAR_TIME_FORMAT)) > 0) {
      console.log("setting done final process");
      postDoc.has_done_final_process = true;
    }

    await calcPostScore(postDoc);
    postDoc.updated_at = moment().utc().format(REGULAR_TIME_FORMAT);

    updatedDocs.push(
      { updateOne : {
          filter : { _id : postDoc._id }, // query data to be updated
          update : { $set : postDoc }, // updates
          upsert: false,
        }
      }
    );

    // update job progress
    job.progress(counter * progressPerDoc);
  }

  // Push the updated docs to db
  const result = postScoreCol.bulkWrite(updatedDocs);

  console.debug("Done updatePostScoreOnDailyProcess, with result: ", result);

  return result;
}

module.exports = {
  updatePostScoreOnDailyProcess,
}
