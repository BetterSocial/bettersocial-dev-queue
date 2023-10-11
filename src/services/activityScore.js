const { calcPostScore } = require("../processes/scoring/calc-post-score");
const { successResponse, errorResponse } = require("../utils");
const { getDb } = require("../config/mongodb_conn");
const { DB_COLLECTION_POST_SCORE } = require("../processes/scoring-constant");

const getListData = async () => {
  const db = await getDb();
  const [ postScoreList ] = await Promise.all([
    db.collection(DB_COLLECTION_POST_SCORE)
  ]);

  return {
    postScoreList
  };
};

const activityScore = async (req, res) => {
  try {
    console.debug("Check activity score");
    const { postScoreList } = await getListData();
    const { activityId, update } = req.body;
    // Validate request body
    if (!activityId || typeof activityId !== "string") {
      return errorResponse(res, "Invalid request body", 400);
    }
    let postScoreDoc = await postScoreList.findOne({ _id: activityId });
    if (!postScoreDoc) {
      return errorResponse(res, "Activity not found", 404);
    }

    let updatedPostScoreDoc;
    try {
      updatedPostScoreDoc = await calcPostScore(postScoreDoc);
    } catch (error) {
      console.error(error);
      return errorResponse(res, "Error calculating post score", 500);
    }

    if(update){
      const updateResult = await postScoreList.updateOne(
        { _id: updatedPostScoreDoc._id }, // query data to be updated
        { $set: updatedPostScoreDoc }, // updates
        { upsert: false } // options
      );
      if(updateResult.modifiedCount === 0){
        return errorResponse(res, "Failed to update activity score", 409);
      }
    }
    return successResponse(res, "Activity Score", updatedPostScoreDoc);
  } catch (error) {
    console.error(error);
    return errorResponse(res, error.toString(), 500);
  }
};

module.exports = {
  activityScore
};
