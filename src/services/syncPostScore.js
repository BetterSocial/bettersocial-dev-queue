const stream = require("getstream");
const { getDb } = require("../config/mongodb_conn");
const { successResponse, errorResponse } = require('../utils');
const { initDataUserScore } = require("../processes/scoring-process")
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
        console.debug("scoring onCreatePost");
        const { postScoreList, userScoreList, db } = await getListData();

        const userScoreDoc = await userScoreList.findOne({ _id: data.user_id });
        console.debug("findOne userScoreDoc result: " + JSON.stringify(userScoreDoc));
        if (!userScoreDoc) {
            // TODO: Create/Sync user score
            throw new Error("User data is not found, with id: " + data.user_id);
        }

        let postScoreDoc = await postScoreList.findOne({ _id: data.feed_id });
        console.debug("findOne postScoreDoc result: " + JSON.stringify(postScoreDoc));
        if (!postScoreDoc) {
            console.debug("init post score doc");
            postScoreDoc = initDataPostScore(data.feed_id, data.created_at);
        }

        // put last post by user
        return await calcScoreOnCreatePost(
            data,
            postScoreDoc,
            postScoreList,
            userScoreDoc,
            userScoreList,
            db
        );
      return successResponse(res, "sync data sucesfully", scoringProcessData);
    } catch (error) {
      console.log(error)
      return errorResponse(res, error.toString(), 500);
    }
  }

module.exports = {
    syncPostScore
};
