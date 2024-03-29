require("dotenv").config;
const moment = require("moment");
const { calcPostScore } = require("./calc-post-score");
const { updateScoreToStream } = require("./update-score-to-stream");
const {
  isStringBlankOrNull,
  countCharactersWithoutLink,
  countWordsWithoutLink,
  dBench,
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
  const W_PUBLIC = process.env.W_PUBLIC || 0.8;
  const { PRIVACY_PUBLIC } = require("../scoring-constant");

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

  // additional post score for public post
  let att_privacy = 1;
  if (data.privacy.toLowerCase() === PRIVACY_PUBLIC) {
    att_privacy = W_PUBLIC;
  }

  console.debug(
    "calcPostAttributesScore: att_anon:" +
      att_anon +
      ", att_type:" +
      att_type +
      ", att_length:" +
      att_length +
      ", att_geo:" +
      att_geo +
      ", att_privacy:" +
      att_privacy
  );
  return att_anon * att_type * att_length * att_geo * att_privacy;
}

function updateLastp3Scores(lastp3Scores, postScoreDoc) {
  // Flow:
  // 1. Update p3 score, if the post id already exists in last_p3_scores
  // 2. If last_p3_scores count less than max post to count in last_p3_scores, then:
  //    1. Increment count
  //    2. Add the post in last_p3_scores
  //    3. If post time is less than minimum time, then update the minimum time with post time, and earliest post id with post id
  // 3. Otherwise:
  //    1. If post time is bigger than min time, then:
  //       1. delete the key pointed by earliest post id
  //       2. Add the post in last_p3_scores
  //       3. Loop over last_p3_scores to find the minimum post time and it's id, then update it in the last_p3_scores

  const existingp3ScoreOfPost = lastp3Scores[postScoreDoc._id];
  if (existingp3ScoreOfPost) {
    existingp3ScoreOfPost.p3_score = postScoreDoc.p3_score;
  } else {
    // the post id not yet exists in the list, continue on step #2
    const currentCount = lastp3Scores._count;
    if (currentCount < 10) {
      lastp3Scores._count = currentCount + 1;
      lastp3Scores[postScoreDoc._id] = {
        time: postScoreDoc.time,
        p3_score: postScoreDoc.p3_score,
      };

      if (currentCount === 0) {
        lastp3Scores._earliest_post_time = postScoreDoc.time;
        lastp3Scores._earliest_post_id = postScoreDoc._id;
      } else {
        const momentTimeOfPost = moment.utc(
          postScoreDoc.time,
          POST_TIME_FORMAT,
          true
        );
        const diffPostTimeAndEarliest = momentTimeOfPost.diff(
          moment.utc(lastp3Scores._earliest_post_time, POST_TIME_FORMAT, true)
        );
        if (diffPostTimeAndEarliest < 0) {
          lastp3Scores._earliest_post_time = postScoreDoc.time;
          lastp3Scores._earliest_post_id = postScoreDoc._id;
        }
      }
    } else {
      // the author already have more than maximum count of post for calculating average p3 score
      delete lastp3Scores[lastp3Scores._earliest_post_id];
      lastp3Scores[postScoreDoc._id] = {
        time: postScoreDoc.time,
        p3_score: postScoreDoc.p3_score,
      };

      let _earliest_post_id = "";
      let _earliest_post_time = "";
      let momentEarliestPostTime;
      for (key in lastp3Scores) {
        if (
          key !== "_count" &&
          key !== "_earliest_post_time" &&
          key !== "_earliest_post_id"
        ) {
          if (_earliest_post_id) {
            const diffPostTimeAndEarliest = momentEarliestPostTime.diff(
              moment.utc(lastp3Scores[key].time, POST_TIME_FORMAT, true)
            );
            if (diffPostTimeAndEarliest > 0) {
              _earliest_post_id = key;
              _earliest_post_time = lastp3Scores[key].time;
              momentEarliestPostTime = moment.utc(
                _earliest_post_time,
                POST_TIME_FORMAT,
                true
              );
            }
          } else {
            _earliest_post_id = key;
            _earliest_post_time = lastp3Scores[key].time;
            momentEarliestPostTime = moment.utc(
              _earliest_post_time,
              POST_TIME_FORMAT,
              true
            );
          }
        }
      }
      lastp3Scores._earliest_post_id = _earliest_post_id;
      lastp3Scores._earliest_post_time = _earliest_post_time;
    }
  }
}

const countLast7DaysPosts = async (
  userScoreDoc,
  userScoreList,
  timeOfPost,
  isNewPost,
  postScoreList
) => {
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
    const dayDiffLastUpdateAndPostTime = moment
      .duration(
        momentTimeOfPost.diff(
          moment.utc(
            userScoreDoc.last_posts.last_update,
            POST_TIME_FORMAT,
            true
          )
        )
      )
      .as("days");

    console.debug("countLast7DaysPosts: there is last posts data");

    // continue, if last_update is earlier from time of post, less than a day.
    // note: minus duration means last update is later than time of post.
    if (
      dayDiffLastUpdateAndPostTime >= 0 &&
      dayDiffLastUpdateAndPostTime <= 1
    ) {
      console.debug(
        "countLast7DaysPosts: last_update is earlier from time of post and less than a day"
      );

      // continue, if earliest_time is not more than 7 days earlier from time of post
      let isUpdate = true;
      if (!isStringBlankOrNull(userScoreDoc.last_posts.earliest_time)) {
        const dayDiffEarliestTimeAndPostTime = moment
          .duration(
            momentTimeOfPost.diff(
              moment.utc(
                userScoreDoc.last_posts.earliest_time,
                POST_TIME_FORMAT,
                true
              )
            )
          )
          .as("days");

        if (dayDiffEarliestTimeAndPostTime <= 7) {
          console.debug(
            "countLast7DaysPosts: earliest_time is not more than 7 days earlier from time of post"
          );
          const currentCount = userScoreDoc.last_posts.counter;

          if (isNewPost) {
            console.debug(
              "countLast7DaysPosts: update the counter, since it new post"
            );
            userScoreDoc.last_posts.last_update = timeOfPost;
            userScoreDoc.last_posts.last_time = timeOfPost;
            userScoreDoc.last_posts.counter = currentCount + 1;
          }

          return currentCount;
        }
      } else {
        console.debug(
          "countLast7DaysPosts: update the counter, since it the first post of the author"
        );
        userScoreDoc.last_posts.earliest_time = timeOfPost;
        userScoreDoc.last_posts.last_update = timeOfPost;
        userScoreDoc.last_posts.last_time = timeOfPost;
        userScoreDoc.last_posts.counter = 1;

        return 0;
      }
    }
  }

  console.debug("countLast7DaysPosts: count it from db");
  // if it goes here, then it means we need to count it from related collection
  const sevenDaysAgoFromTimeOfPost = momentTimeOfPost
    .subtract(7, "days")
    .format(POST_TIME_FORMAT);
  console.debug(
    "countLast7DaysPosts => 7 days ago from time of post: " +
      sevenDaysAgoFromTimeOfPost
  );
  console.debug("countLast7DaysPosts => time of post: " + timeOfPost);
  const aggrCursor = await postScoreList.aggregate([
    // stage 1: filtered out the documents that we want to aggregated
    {
      $match: {
        author_id: userScoreDoc._id,
        time: { $gt: sevenDaysAgoFromTimeOfPost, $lt: timeOfPost },
      },
    },
    // stage 2: get the count, max, and min
    {
      $group: {
        _id: null,
        counter: { $count: {} },
      },
    },
  ]);

  let counter = 0;
  await aggrCursor.forEach((result) => {
    console.debug("countLast7DaysPosts => db result: " + result);
    if (result.counter) {
      counter = result.counter;
      console.debug("countLast7DaysPosts => count from db result: " + counter);
    }
  });

  console.debug("countLast7DaysPosts => returning counter: " + counter);

  return counter;
};

const calcScoreOnCreatePost = async (
  data,
  postScoreDoc,
  postScoreList,
  userScoreDoc,
  userScoreList,
  db
) => {
  console.debug("Starting calcScoreOnCreatePost");

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
  postScoreDoc.count_weekly_posts = await countLast7DaysPosts(
    userScoreDoc,
    userScoreList,
    data.time,
    isNewPost,
    postScoreList
  );

  const wordsCount = countWordsWithoutLink(data.message);
  postScoreDoc.W_score = wordsCount;
  postScoreDoc.D_bench_score = dBench(DUR_MIN, DUR_MARG, wordsCount);
  postScoreDoc.u_score = userScoreDoc.user_score;

  await calcPostScore(postScoreDoc);

  postScoreDoc.updated_at = moment().utc().format(REGULAR_TIME_FORMAT); // format current time in utc

  const result = await postScoreList.updateOne(
    { _id: postScoreDoc._id }, // query data to be updated
    { $set: postScoreDoc }, // updates
    { upsert: true } // options
  );

  updateLastp3Scores(userScoreDoc.last_p3_scores, postScoreDoc);

  console.debug("Update on create post event: " + JSON.stringify(result));
  console.debug(
    "calcScoreOnCreatePost => post score doc: " + JSON.stringify(postScoreDoc)
  );

  await Promise.all([
    userScoreList.updateOne(
      { _id: userScoreDoc._id }, // query data to be updated
      {
        $set: {
          last_p3_scores: userScoreDoc.last_p3_scores,
          last_posts: userScoreDoc.last_posts,
          updated_at: moment().utc().format(REGULAR_TIME_FORMAT),
        },
      }, // updates
      { upsert: false } // options
    ),

    updateScoreToStream(postScoreDoc),
  ]);

  return result;
};

module.exports = {
  calcScoreOnCreatePost,
};
