require('dotenv').config;
const moment = require("moment");
const { calcPostScore } = require("./calc-post-score");
const { updateScoreToStream } = require("./update-score-to-stream");
const {
  isStringBlankOrNull, countCharactersWithoutLink,
  countWordsWithoutLink, dBench
} = require("../../utils");
const POST_TIME_FORMAT = "YYYY-MM-DDTHH:mm:ss.SSSSSS";
const REGULAR_TIME_FORMAT = "YYYY-MM-DD HH:mm:ss";

function containsLink(str) {
  const urlRegex = /(https?:\/\/[^ ]*)/;
  const matchUrl = str.match(urlRegex);

  if (matchUrl) {
    return true;
  } else {
    return false;
  }
}

function calcPostAttributesScore(data, hasLink) {
  const W_ANON = process.env.W_ANON || 0.8;
  const W_HASMEDIA = process.env.W_HASMEDIA || 0.9;
  const W_HASPOLL = process.env.W_HASPOLL || 1.8;
  const W_HASLINK = process.env.W_HASLINK || 1.2;
  const W_SHORT = process.env.W_SHORT || 0.6;
  const W_LONG = process.env.W_LONG || 1.2;
  const W_ZIP = process.env.W_ZIP || 2;
  const W_NHOOD = process.env.W_NHOOD || 2;
  const W_CITY = process.env.W_CITY || 1.6;
  const W_STATE = process.env.W_STATE || 1.2;
  const W_GLOBAL = process.env.W_GLOBAL || 0.8;

  let att_anon = 1;
  if (data.anonimity) {
    att_anon = W_ANON;
  }

  let att_type = 1;
  if (data.images_url && data.images_url.length > 0) {
    att_type = W_HASMEDIA;
  } else if (data.poll_id) {
    att_type = W_HASPOLL;
  } else if (hasLink) {
    att_type = W_HASLINK;
  }

  let att_length = 1;
  const countChars = countCharactersWithoutLink(data.message);
  if (countChars < 50) {
    att_length = W_SHORT;
  } else if (countChars > 200) {
    att_length = W_LONG;
  }

  let att_geo = 1;
  switch (data.location_level.toLowerCase()) {
    case "zip":
      att_geo = W_ZIP;
      break;
    case "neighborhood":
      att_geo = W_NHOOD;
      break;
    case "city":
      att_geo = W_CITY;
      break;
    case "state":
      att_geo = W_STATE;
      break;
    case "everywhere":
      att_geo = W_GLOBAL;
      break;
  }

  console.debug("calcPostAttributesScore: att_anon:" + att_anon + ", att_type:" + att_type + ", att_length:" + att_length + ", att_geo:" + att_geo);
  return att_anon * att_type * att_length * att_geo;
}

const countLast7DaysPosts = async(userScoreDoc, userScoreList, timeOfPost, isNewPost, postScoreList) => {
  /*
   * The main concept is:
   * 1. Use and update the counter in userScoreDoc whenever it's make sense to use.
   *    By the mean of make sense:
   *    1. last_update is earlier from time of post, less than a day (means this info have been updated at least from daily process)
   *    2. earliest_time is not more than 7 days earlier from time of post. If it's more than 7 days before, surely it's not an uptodated counter.
   * 2. If it doesn't make sense to use the userScoreDoc (most likely, it's a reprocess of post creation),
   *    then calculate it from db
   */

  // Get the time of post in moment object, so it would be easier to count the difference between times.
  const momentTimeOfPost = moment.utc(timeOfPost, POST_TIME_FORMAT, true);

  if (!isStringBlankOrNull(userScoreDoc.last_posts.last_update)) {
    const dayDiffLastUpdateAndPostTime = moment.duration(momentTimeOfPost.diff(moment.utc(userScoreDoc.last_posts.last_update, REGULAR_TIME_FORMAT, true))).as('days');

    console.debug("countLast7DaysPosts: there is last posts data");

    // continue, if last_update is earlier from time of post, less than a day.
    // note: minus duration means last update is later than time of post.
    if (dayDiffLastUpdateAndPostTime >= 0 && dayDiffLastUpdateAndPostTime <= 1) {
      console.debug("countLast7DaysPosts: last_update is earlier from time of post and less than a day");

      // continue, if earliest_time is not more than 7 days earlier from time of post
      const dayDiffEarliestTimeAndPostTime = moment.duration(momentTimeOfPost.diff(moment.utc(userScoreDoc.last_posts.earliest_time, REGULAR_TIME_FORMAT, true))).as('days');

      if (dayDiffEarliestTimeAndPostTime <= 7) {
        console.debug("countLast7DaysPosts: earliest_time is not more than 7 days earlier from time of post");

        const formattedTimeOfPost = momentTimeOfPost.format(REGULAR_TIME_FORMAT);;
        const currentCount = userScoreDoc.last_posts.counter;

        if (isNewPost) {
          console.debug("countLast7DaysPosts: update the counter, since it new post");
          userScoreDoc.last_posts.last_update = formattedTimeOfPost;
          userScoreDoc.last_posts.last_time = formattedTimeOfPost;
          userScoreDoc.last_posts.counter = currentCount + 1;

          await userScoreList.updateOne(
            { _id : userScoreDoc._id }, // query data to be updated
            { $set : {
              last_posts : userScoreDoc.last_posts,
              updated_at : moment().utc().format(REGULAR_TIME_FORMAT),
            } }, // updates
            { upsert: false } // options
          );
        }

        return currentCount;
      }
    }
  }

  console.debug("countLast7DaysPosts: count it from db");
  // if it goes here, then it means we need to count it from related collection
  const sevenDaysAgoFromTimeOfPost = momentTimeOfPost.subtract(7, 'days').format(POST_TIME_FORMAT);
  console.debug("countLast7DaysPosts => 7 days ago from time of post: " + sevenDaysAgoFromTimeOfPost);
  console.debug("countLast7DaysPosts => time of post: " + timeOfPost);
  const aggrCursor = await postScoreList.aggregate([
    // stage 1: filtered out the documents that we want to aggregated
    { $match: { author_id: userScoreDoc._id, time: { $gt: sevenDaysAgoFromTimeOfPost, $lt: timeOfPost} } },
    // stage 2: get the count, max, and min
    { $group: {
      _id: null,
      counter: { $count: { } }
      }
    }
  ]);

  let counter = 0;
  await aggrCursor.forEach(result => {
    console.debug("countLast7DaysPosts => db result: " + result);
    if (result.counter) {
      counter = result.counter;
      console.debug("countLast7DaysPosts => count from db result: " + counter);
    }
  });

  console.debug("countLast7DaysPosts => returning counter: " + counter);

  return counter;
}

const calcScoreOnCreatePost = async(data, postScoreDoc, postScoreList, userScoreDoc, userScoreList, db) => {
  console.debug("Starting calcScoreOnCreatePost");

  /*
    _id: feedId,
    foreign_id: "",
    time: "",
    author_id: "",
    has_link: false,
    expiration_setting: "24",
    expired_at: "",
    rec_score: 1.0, // recency score, based on expiration setting and now
    att_score: 1.0, // post-attributes score
    count_weekly_posts: 0.0, // total posts by user A (author) within last 7 days before this post
    impr_score: 0.0,
    domain_score: 1.0,
    longC_score: 0.0,
    p_longC_score: 1.0,
    W_score: 0.0,
    D_bench_score: 0.0,
    D_score: 0.0,
    downvote_point: 0.0,
    upvote_point: 0.0,
    s_updown_score: 0.0,
    BP_score: 0.0,
    WS_updown_score: 0.0,
    WS_D_score: 0.0,
    WS_nonBP_score: 1.0,
    p_perf_score: 1.0,
    p2_score: 0.0,
    p3_score: 1.0,
    u_score: 1.0,
    post_score: 0.0,
    has_done_final_process: false,
    created_at: timestamp,
    updated_at: timestamp,
 */
  const DUR_MIN = process.env.DUR_MIN;
  const DUR_MARG = process.env.DUR_MARG;

  // check whether it's a new post or reprocess of create post event.
  let isNewPost = true;
  if (postScoreDoc.time) {
    if (postScoreDoc.time !== "") {
      isNewPost = false;
    }
  }

  postScoreDoc.foreign_id = data.foreign_id;
  postScoreDoc.time = data.time;
  postScoreDoc.author_id = data.user_id;
  postScoreDoc.expiration_setting = data.duration_feed || ""; // just need to make sure the value will be in string type
  postScoreDoc.expired_at = data.expired_at;
  postScoreDoc.topics = data.topics;
  postScoreDoc.privacy = data.privacy;
  postScoreDoc.anonimity = data.anonimity;

  const hasLink = containsLink(data.message);
  postScoreDoc.has_link = hasLink;
  postScoreDoc.att_score = calcPostAttributesScore(data, hasLink);

  // count weekly posts
  postScoreDoc.count_weekly_posts = await countLast7DaysPosts(userScoreDoc, userScoreList, data.time, isNewPost,  postScoreList);

  const wordsCount = countWordsWithoutLink(data.message);
  postScoreDoc.W_score = wordsCount;
  postScoreDoc.D_bench_score = dBench(DUR_MIN, DUR_MARG, wordsCount);
  postScoreDoc.u_score = userScoreDoc.user_score;

  await calcPostScore(postScoreDoc);

  postScoreDoc.updated_at = moment().utc().format(REGULAR_TIME_FORMAT); // format current time in utc

  const result = await postScoreList.updateOne(
    { _id : postScoreDoc._id }, // query data to be updated
    { $set : postScoreDoc }, // updates
    { upsert: true } // options
  );

  console.debug("Update on create post event: " + JSON.stringify(result));
  console.debug("calcScoreOnCreatePost => post score doc: " + JSON.stringify(postScoreDoc));

  //await updateScoreToStream(postScoreDoc);

  return result;
};

module.exports = {
  calcScoreOnCreatePost
}
