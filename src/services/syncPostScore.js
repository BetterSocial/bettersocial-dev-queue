const stream = require("getstream");
const moment = require("moment");
const { getDb } = require("../config/mongodb_conn");
const { successResponse, errorResponse } = require('../utils');
const PostsFunction = require("../databases/functions/posts");
const { calcScoreOnCreatePost } = require("../processes/scoring")
const {
  DB_COLLECTION_USER_SCORE,
  DB_COLLECTION_POST_SCORE,
  DB_COLLECTION_USER_POST_SCORE
} = require("../processes/scoring-constant");

const getListData = async () => {
    const db = await getDb();
    const [userScoreList, postScoreList, userPostScoreList] = await Promise.all([
      db.collection(DB_COLLECTION_USER_SCORE),
      db.collection(DB_COLLECTION_POST_SCORE),
      db.collection(DB_COLLECTION_USER_POST_SCORE),
    ]);

    return {
      userScoreList,
      postScoreList,
      userPostScoreList,
      db
    };
  };

const syncPostScore = async (req, res) => {
    try {
      // sampel post id = 63b9334e-968e-4c93-9572-67705c01d145
      // 3cc43812-4892-11ee-8315-0a319bc15cb3
        let { postId } = req.body
        // Get post object
        let data_post = await PostsFunction.getPostByPostId(postId);
        // Get activities from getstream
        const client = stream.connect(process.env.API_KEY, process.env.SECRET, process.env.APP_ID);
        let activity = await client.getActivities({ids: [postId]})
        console.log("DEBUG => ",activity)

        // const scoringProcessData = {
        //   feed_id: data_post?.id,
        //   foreign_id: data?.foreign_id,
        //   time: post?.time,
        //   user_id: userDetail.user_id,
        //   location: locationDetail?.location_level || '',
        //   message: data?.message,
        //   topics: data?.topics,
        //   privacy: data?.privacy,
        //   anonimity: data?.anonimity,
        //   location_level: locationToPost,
        //   duration_feed: data?.duration_feed,
        //   expired_at: data?.expired_at
        //     ? moment.utc(data?.expired_at).format('YYYY-MM-DD HH:mm:ss')
        //     : '',
        //   images_url: data?.images_url,
        //   created_at: moment.utc().format('YYYY-MM-DD HH:mm:ss')
        // };

        // const { postScoreList, userScoreList, db } = await getListData();

        // const userScoreDoc = await userScoreList.findOne({ _id: data.user_id });
        // console.debug("findOne userScoreDoc result: " + JSON.stringify(userScoreDoc));
        // if (!userScoreDoc) {
        //     // TODO: Create/Sync user score
        //     throw new Error("User data is not found, with id: " + data.user_id);
        // }

        // let postScoreDoc = await postScoreList.findOne({ _id: data.feed_id });
        // console.debug("findOne postScoreDoc result: " + JSON.stringify(postScoreDoc));
        // if (!postScoreDoc) {
        //     console.debug("init post score doc");
        //     postScoreDoc = initDataPostScore(data.feed_id, data.created_at);
        // }

        // // put last post by user
        // return await calcScoreOnCreatePost(
        //     data,
        //     postScoreDoc,
        //     postScoreList,
        //     userScoreDoc,
        //     userScoreList,
        //     db
        // );
      return successResponse(res, "sync post score sucesfully", []);
    } catch (error) {
      console.log(error)
      return errorResponse(res, error.toString(), 500);
    }
  }

module.exports = {
    syncPostScore
};
