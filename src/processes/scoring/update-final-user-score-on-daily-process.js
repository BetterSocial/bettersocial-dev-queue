const moment = require("moment");
const {
  DB_COLLECTION_USER_SCORE,
  DB_COLLECTION_POST_SCORE,
  DB_COLLECTION_USER_POST_SCORE,
  POST_TIME_FORMAT,
  REGULAR_TIME_FORMAT,
  EVENT_DAILY_PROCESS_POST_SCORE,
} = require("../scoring-constant");

const scoringProcessQueue = require("../../queues/queueSenderForRedis"); // uncomment this line if using redis as message queue server
//const scoringProcessQueue = require("../../queues/queueSenderForKafka"); // uncomment this line if using kafka as message queue server

const batchSize = process.env.SCORING_DAILY_PROCESS_BATCH_SIZE;

async function checkNotYetDailyProcessedUserScore(userScoreCol, processTime) {
  const delayMs = process.env.SCORING_DAILY_PROCESS_CHECK_ALL_PROCESSED_DELAY_MS || 60000;
  const maxLoop = process.env.SCORING_DAILY_PROCESS_CHECK_ALL_PROCESSED_MAX_LOOP || 120;

  for (let loopCount = 0; loopCount < maxLoop; loopCount++) {
    console.log("Check user score. counter=", loopCount);

    const countResult = await userScoreCol.count({
      "last_daily_process": { $ne: processTime },
      "created_at": { $lte : processTime },
    }, {
      readConcern: "majority",
    });

    if (countResult === 0) {
      break;
    }

    await new Promise(resolve => setTimeout(resolve, delayMs));
  }
}

const updateFinalUserScoreOnDailyProcess = async(userScoreCol, processTime, postScoreCol) => {
  console.debug("Starting updateFinalUserScoreOnDailyProcess");

  const momentNow = moment.utc();
  const endTime = momentNow.format(REGULAR_TIME_FORMAT);
  const endTimePost = momentNow.format(POST_TIME_FORMAT);

  // set the time to the prev 7 days
  momentNow.subtract(7, 'days');
  const startTime = momentNow.format(REGULAR_TIME_FORMAT);
  const startTimePost = momentNow.format(POST_TIME_FORMAT);

  // console.log("startTime: %", startTime);
  // console.log("startTimePost: %", startTimePost);
  // console.log("endTime: %", endTime);
  // console.log("endTimePost: %", endTimePost);

  const timestamp = endTime;
  // console.log("timestamp: %", timestamp);

  // check for not yet daily processed user-score data
  await checkNotYetDailyProcessedUserScore(userScoreCol, processTime);

  // update last upvotes, downvotes, blocks, and posts.
  // reset update the y_score and user_score
  // console.log("Updating last stat info, and reset y score");
  let cursor;
  cursor = await userScoreCol.aggregate( [
    // Stage 1: lookup to user_post_score by user_id
    { $lookup : {
      from: DB_COLLECTION_USER_POST_SCORE,
      let: {
        user_id: "$_id",
        start_time: startTime,
        end_time: endTime,
      },
      pipeline: [
        { $match :
          // user_id = user_id AND
          // ( (last_updown >= startTime AND last_updown < endTime) OR
          //   (last_block >= startTime AND last_block < endTime) )
          { $expr:
            { $and: [
              { $eq: [ "$user_id", "$$user_id" ] },
              { $or: [
                { $and: [
                  { $gte: [ "$last_updown", "$$start_time" ] },
                  { $lt: [ "$last_updown", "$$end_time" ] },
                ] },
                { $and: [
                  { $gte: [ "$last_block", "$$start_time" ] },
                  { $lt: [ "$last_block", "$$end_time" ] },
                ] },
              ] },
            ] },
          },
        },
        {
          $facet: {
            "last_upvotes": [
              { $group: {
                _id: null,
                counter: { $sum: "$upvote_count" },
                earliest_time: { $min: "$last_updown" },
                last_time: { $max: "$last_updown" },
              }},
              {
                $match: { "counter": { $gt: 0 } }
              },
              { $project: { _id: 0 } },
            ],
            "last_downvotes": [
              { $group: {
                _id: null,
                counter: { $sum: "$downvote_count" },
                earliest_time: { $min: "$last_updown" },
                last_time: { $max: "$last_updown" },
              }},
              {
                $match: { "counter": { $gt: 0 } }
              },
              { $project: { _id: 0 } },
            ],
            "last_blocks": [
              { $group: {
                _id: null,
                counter: { $sum: "$block_count" },
                earliest_time: { $min: "$last_block" },
                last_time: { $max: "$last_block" },
              }},
              {
                $match: { "counter": { $gt: 0 } }
              },
              { $project: { _id: 0 } },
            ],
          },
        },
      ],
      as: "last_action_list",
    } },
    { $unwind: "$last_action_list" },
    // Stage 2: buat facet atas last upvote, last downvote, last block
    { $lookup : {
      from: DB_COLLECTION_POST_SCORE,
      let: {
        user_id: "$_id",
        start_time: startTimePost,
        end_time: endTimePost,
      },
      pipeline: [
        { $match :
          // user_id = user_id AND
          // time >= startTime AND time < endTime
          { $expr:
            { $and: [
              { $eq: [ "$author_id", "$$user_id" ] },
              { $gte: [ "$time", "$$start_time" ] },
              { $lt: [ "$time", "$$end_time" ] },
            ] },
          },
        },
        { $group: {
          _id: null,
          counter: { $count: {} },
          earliest_time: { $min: "$time" },
          last_time: { $max: "$time" },
        }},
        {
          $match: { "counter": { $gt: 0 } }
        },
        { $project: { _id: 0 } },
      ],
      as: "last_posts",
    } },
    //{ $unwind: "$last_posts" },
    // Stage 3: order by following user id
    //{ $sort : { "_id": 1 } },
    { $project : {
      "_id": 1,
      "last_upvotes": {
        $cond: {
          if: { $ne: [ 0, { $size: "$last_action_list.last_upvotes"} ] },
          then: { $arrayElemAt : [ "$last_action_list.last_upvotes", 0 ] },
          else: { counter: 0, earliest_time: "", last_time: ""},
        }
      },
      "last_downvotes": {
        $cond: {
          if: { $ne: [ 0, { $size: "$last_action_list.last_downvotes"} ] },
          then: { $arrayElemAt : [ "$last_action_list.last_downvotes", 0 ] },
          else: { counter: 0, earliest_time: "", last_time: ""},
        }
      },
      "last_blocks": {
        $cond: {
          if: { $ne: [ 0, { $size: "$last_action_list.last_blocks"} ] },
          then: { $arrayElemAt : [ "$last_action_list.last_blocks", 0 ] },
          else: { counter: 0, earliest_time: "", last_time: ""},
        }
      },
      "last_posts": {
        $cond: {
          if: { $ne: [ 0, { $size: "$last_posts"} ] },
          then: { $arrayElemAt : [ "$last_posts", 0 ] },
          else: { counter: 0, earliest_time: "", last_time: ""},
        }
      },
    } },
    { $addFields: {
      "last_upvotes.last_update": timestamp,
      "last_downvotes.last_update": timestamp,
      "last_blocks.last_update": timestamp,
      "last_posts.last_update": timestamp,
      "y_score": 0,
      "user_score": 0,
      "updated_at": timestamp,
    } },
    { $merge: {
      into: DB_COLLECTION_USER_SCORE,
      on: "_id",
      whenMatched: "merge",
      whenNotMatched: "fail",
    } },
  ] );

  cursor.forEach((item) => {
    console.dir(item, {depth: null});
  });

  // console.log("Updating y score and final user score");
  cursor = await userScoreCol.aggregate([
    { $unwind: "$following" },
    { $group: { _id: "$following", y_score: { $sum: "$u1_score" } } },
    { $lookup: {
      from: DB_COLLECTION_USER_SCORE,
      localField: "_id",
      foreignField: "_id",
      as: "user_doc",
      pipeline: [
        { $project: { u1_score: 1 } }, // we need the u1_score for the next pipeline of aggregate
      ],
    }},
    { $unwind: "$user_doc" },
    { $addFields: { "user_score": { $multiply: [ "$user_doc.u1_score", "$y_score" ] } } },
    { $project: { y_score: 1, user_score: 1 } },
    { $merge: {
      into: DB_COLLECTION_USER_SCORE,
      on: "_id",
      whenMatched: "merge",
      whenNotMatched: "fail",
    } },
  ]);

  cursor.forEach((item) => {
    console.dir(item, {depth: null});
  });

  console.debug("Done updateFinalUserScoreOnDailyProcess");

  await triggerPostScoreDailyProcess(postScoreCol);
};

const triggerPostScoreDailyProcess = async(postScoreCol) => {
  console.debug("Starting triggerPostScoreDailyProcess");

  // console.log("Batch size: ", batchSize);

  const processTime = moment.utc().format(REGULAR_TIME_FORMAT);

  // get all post ids
  const cursors = await postScoreCol.aggregate([
    { $match : { "has_done_final_process": { $eq: false } } },
    { $lookup: {
      from: DB_COLLECTION_USER_SCORE,
      localField: "author_id",
      foreignField: "_id",
      as: "user_doc",
      pipeline: [
        { $project: { user_score: 1 } },
      ],
    }},
    { $unwind: "$user_doc" },
  ]);

  let result;
  let counter = 0;
  let postIds = [];
  let userScoreListByPostId = {};
  while (await cursors.hasNext()) {

    result = await cursors.next();

    // create list if post id to be processed later
    postIds.push(result._id);
    // also create list of user score by post id, to be processed later too
    // on daily process of post score
    userScoreListByPostId[result._id] = result.user_doc.user_score;

    counter++;

    if (counter >= batchSize) {
      //console.log("Batch size limit");
      if (await cursors.hasNext()) {
        //console.log("Sending queue");
        sendQueuePostScore(postIds, processTime, false, userScoreListByPostId);
      } else {
        //console.log("Sending queue for last batch");
        sendQueuePostScore(postIds, processTime, true, userScoreListByPostId);
      }

      counter = 0;
      postIds = [];
      userScoreListByPostId = {};
    }
  }

  // send the last batch of the post ids
  if (postIds.length !== 0) {
    //console.log("Sending queue for last batch outside loop");
    sendQueuePostScore(postIds, processTime, true, userScoreListByPostId);
  }
};

function sendQueuePostScore(postIds, processTime, lastBatch, userScoreListByPostId) {
  // sending queue for scoring process on follow user event
  const scoringProcessData = {
    process_time: processTime,
    post_ids: postIds,
    last_batch: lastBatch,
    user_scores: userScoreListByPostId,
  };
  scoringProcessQueue.sendQueueForDailyProcess(EVENT_DAILY_PROCESS_POST_SCORE, scoringProcessData);
}

module.exports = {
  updateFinalUserScoreOnDailyProcess,
}
