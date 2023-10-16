const { updateLastp3Scores } = require("../processes/scoring/calc-user-score");
const { successResponse, errorResponse } = require("../utils");
const { getDb } = require("../config/mongodb_conn");
const { DB_COLLECTION_POST_SCORE, DB_COLLECTION_USER_SCORE } = require("../processes/scoring-constant");

const getListData = async () => {
  const db = await getDb();
  const [ postScoreList, userScoreList ] = await Promise.all([
    db.collection(DB_COLLECTION_POST_SCORE),
    db.collection(DB_COLLECTION_USER_SCORE)
  ]);

  return {
    postScoreList,
    userScoreList
  };
};

const lastP3Score = async (req, res) => {
  try {
    console.debug("Check activity score");
    const { postScoreList, userScoreList } = await getListData();
    const { userId, activityId, update } = req.body;

    if (!activityId || typeof activityId !== "string" || !userId || typeof userId !== "string") {
      return errorResponse(res, "Invalid request body", 400);
    }
    let userScoreDoc = await userScoreList.findOne({ _id: userId }, { p3_score: 1 });
    if (!userScoreDoc) {
      return errorResponse(res, "User not found", 404);
    }
    let postScoreDoc = await postScoreList.findOne({ _id: activityId });
    if (!postScoreDoc) {
      return errorResponse(res, "Activity not found", 404);
    }

    let updatedUserScoreDoc;
    try {
      updatedUserScoreDoc = await updateLastp3Scores(userScoreDoc,postScoreDoc);
    } catch (error) {
      console.error(error);
      return errorResponse(res, "Error calculating post score", 500);
    }

    if(update){
      const updateResult = await userScoreList.updateOne(
        { _id: updatedUserScoreDoc._id }, // query data to be updated
        { $set: updatedUserScoreDoc }, // updates
        { upsert: false } // options
      );
      if(updateResult.modifiedCount === 0){
        return errorResponse(res, "Failed to update p3_score score", 409);
      }
    }
    return successResponse(res, "User Score", updatedUserScoreDoc);
  } catch (error) {
    console.error(error);
    return errorResponse(res, error.toString(), 500);
  }
};

module.exports = {
  lastP3Score
};
