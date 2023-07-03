require("dotenv").config;
const moment = require("moment");
const { calcUserPostScore } = require("./calc-user-post-score");
const { calcPostScore } = require("./calc-post-score");
const { updateLastp3Scores } = require("./calc-user-score");
const { updateScoreToStream } = require("./update-score-to-stream");
const { countCharactersWithoutLink } = require("../../utils");
const REGULAR_TIME_FORMAT = "YYYY-MM-DD HH:mm:ss";

const calcScoreOnCommentPost = async (
  data,
  postScoreDoc,
  postScoreList,
  userPostScoreDoc,
  userPostScoreList,
  authorUserScoreDoc,
  userScoreList
) => {
  console.debug("Starting calcScoreOnCommentPost");

  /*
    _id: userId+":"+feedId,
    user_id: userId,
    feed_id: feedId,
    author_id: "",
    topics_followed: 0,
    author_follower: false,
    second_degree_follower: false,
    domain_follower: false,
    p1_score: 0.0,
    upvote_count: 0,
    downvote_count: 0,
    block_count: 0,
    seen_count: 0,
    p_prev_score: 0.0,
    post_score: 0.0,
    user_post_score: 0.0,
    activity_log: {},
    anomaly_activities: {
      upvote_time: "",
      cancel_upvote_time: "",
      downvote_time: "",
      cancel_downvote_time: "",
      block_time: "",
      unblock_time: "",
    },
    created_at: timestamp,
    updated_at: timestamp,
 */

  // first of all, check the user. It should count if it's not the author itself
  if (data.user_id !== postScoreDoc.author_id) {
    const timestamp = moment().utc().format(REGULAR_TIME_FORMAT);

    // add activity log if not exists yet. Assumed the activity is unique by time, it means
    // there won't be different event in the same second.
    const existingActivityLog =
      userPostScoreDoc.activity_log[data.activity_time];
    if (existingActivityLog) {
      console.debug(
        "calcScoreOnCommentPost -> skip comment count since it already exists in the log : " +
          existingActivityLog
      );
    } else {
      userPostScoreDoc.activity_log[data.activity_time] = "comment";

      console.debug("calcScoreOnCommentPost -> increment comment count");

      const countChar = countCharactersWithoutLink(data.message);

      // Update post-score doc:
      //    1. Increment longC_score
      //    2. Recalculate post score
      const LONG_C = process.env.LONG_C || 80.0;
      if (countChar > LONG_C) {
        postScoreDoc.longC_score = postScoreDoc.longC_score + 1;
      }
      await calcPostScore(postScoreDoc);
      postScoreDoc.updated_at = timestamp; // format current time in utc

      // Update user-post score doc:
      //    1. comment_count + 1
      //    2. add comment log
      //    3. Re-calculate and update the user-post score
      userPostScoreDoc.comment_count = userPostScoreDoc.comment_count + 1;
      userPostScoreDoc.comment_log[data.comment_id] = countChar;
      userPostScoreDoc.author_id = postScoreDoc.author_id;
      userPostScoreDoc.post_score = postScoreDoc.post_score;
      await calcUserPostScore(userPostScoreDoc);
      userPostScoreDoc.updated_at = moment().utc().format(REGULAR_TIME_FORMAT); // format current time in utc

      // Update last p3 scores in user score doc
      updateLastp3Scores(authorUserScoreDoc, postScoreDoc);
      authorUserScoreDoc.updated_at = timestamp; // format current time in utc

      const [, , result] = await Promise.all([
        userScoreList.updateOne(
          { _id: authorUserScoreDoc._id }, // query data to be updated
          {
            $set: {
              last_p3_scores: authorUserScoreDoc.last_p3_scores,
              updated_at: authorUserScoreDoc.updated_at,
            },
          }, // updates
          { upsert: false } // options
        ),

        postScoreList.updateOne(
          { _id: postScoreDoc._id }, // query data to be updated
          { $set: postScoreDoc }, // updates
          { upsert: false } // options
        ),
        userPostScoreList.updateOne(
          { _id: userPostScoreDoc._id }, // query data to be updated
          { $set: userPostScoreDoc }, // updates
          { upsert: true } // options
        ),

        updateScoreToStream(postScoreDoc),
      ]);

      console.debug("Update on comment post event: " + JSON.stringify(result));
      console.debug(
        "calcScoreOnCommentPost => user post score doc: " +
          JSON.stringify(userPostScoreDoc)
      );

      return result;
    }
  }
};

module.exports = {
  calcScoreOnCommentPost,
};
