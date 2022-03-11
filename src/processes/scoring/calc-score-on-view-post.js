require('dotenv').config;
const moment = require("moment");
const { calcUserPostScore } = require("./calc-user-post-score");
const { calcPostScore } = require("./calc-post-score");
const REGULAR_TIME_FORMAT = "YYYY-MM-DD HH:mm:ss";

const calcScoreOnViewPost = async(data, postScoreDoc, postScoreList, userPostScoreDoc, userPostScoreList) => {
  console.debug("Starting calcScoreOnViewPost");

  // first of all, check the user. It should count if it's the author itself
  if (data.user_id !== postScoreDoc.author_id) {
    const timestamp = moment().utc().format(REGULAR_TIME_FORMAT);

    // add activity log if not exists yet. Assumed the activity is unique by time, it means
    // there won't be different event in the same second.
    const existingActivityLog = userPostScoreDoc.activity_log[data.activity_time];
    if (existingActivityLog) {
      console.debug("calcScoreOnViewPost -> skip view count since it already exists in the log : " + existingActivityLog);
    } else {
      if (data.is_pdp) {
        userPostScoreDoc.activity_log[data.activity_time] = 'view-pdp';
      } else {
        userPostScoreDoc.activity_log[data.activity_time] = 'view';
      }


      // Update post-score doc:
      //    1. Increment impr_score
      //    2. Increment d_score if (duration > d_bench OR access PDP)
      //    3. Recalculate post score
      const DUR_MIN_IMPR = process.env.DUR_MIN_IMPR || 500.0;
      console.debug("calcScoreOnViewPost -> increment impression count, DUR_MIN_IMPR:" + DUR_MIN_IMPR + ", data.view_duration >= DUR_MIN_IMPR:" + (data.view_duration >= DUR_MIN_IMPR));
      if (data.view_duration >= DUR_MIN_IMPR) { // count as impression, if view duration is more than minimum duration

        console.debug("calcScoreOnViewPost -> increment D_score, D_bench: " + postScoreDoc.D_bench_score + ", due to duration more than benchmark:" + (data.view_duration > postScoreDoc.D_bench_score) + ", PDP=" + data.is_pdp);

        postScoreDoc.impr_score = postScoreDoc.impr_score + 1;
        if (data.view_duration > postScoreDoc.D_bench_score || data.is_pdp) {
          postScoreDoc.D_score = postScoreDoc.D_score + 1;
        }

        await calcPostScore(postScoreDoc);
        postScoreDoc.updated_at = timestamp; // format current time in utc

        // Update user-post score doc:
        //    1. seen_count + 1
        //    2. add impression log
        //    3. Re-calculate and update the user-post score
        userPostScoreDoc.seen_count = userPostScoreDoc.seen_count + 1;
        userPostScoreDoc.impression_log[data.activity_time] = {
          duration: data.view_duration,
          is_pdp: data.is_pdp,
        };
        userPostScoreDoc.author_id = postScoreDoc.author_id;
        userPostScoreDoc.post_score = postScoreDoc.post_score;
        await calcUserPostScore(userPostScoreDoc);
        userPostScoreDoc.updated_at = moment().utc().format(REGULAR_TIME_FORMAT); // format current time in utc

        await postScoreList.updateOne(
          { _id : postScoreDoc._id }, // query data to be updated
          { $set : postScoreDoc }, // updates
          { upsert: false } // options
        );

        const result = await userPostScoreList.updateOne(
          { _id : userPostScoreDoc._id }, // query data to be updated
          { $set : userPostScoreDoc }, // updates
          { upsert: true } // options
        );

  //      await updateScoreToStream(postScoreDoc);

        console.debug("Update on view post event: " + JSON.stringify(result));
        console.debug("calcScoreOnViewPost => user post score doc: " + JSON.stringify(userPostScoreDoc));

        return result;
      }
    }
  }
};

module.exports = {
  calcScoreOnViewPost
}
