const { getDb } = require("../config/mongodb_conn");
const { successResponse, errorResponse } = require("../utils");
const { DB_COLLECTION_POST_SCORE } = require("../processes/scoring-constant");
const { updateScoreToStream } = require("../processes/scoring/update-score-to-stream");

const getListData = async () => {
  const db = await getDb();
  const [ postScoreList ] = await Promise.all([
    db.collection(DB_COLLECTION_POST_SCORE)
  ]);

  return {
    postScoreList
  };
};

const updatePostScoreGetstream = async (req, res) => {
  try {
    const { postScoreList } = await getListData();
    const { activityId } = req.body;

    if (!activityId || typeof activityId !== "string" ) {
      return errorResponse(res, "Invalid request body", 400);
    }
    let postScoreDoc = await postScoreList.findOne({ _id: activityId });
    if (!postScoreDoc) {
      return errorResponse(res, "Activity not found", 404);
    }

    const result = await updateScoreToStream(postScoreDoc);
    return successResponse(res, "update data sucesfully", result);
  } catch (error) {
    console.log(error);
    return errorResponse(res, error.toString(), 500);
  }
};

module.exports = {
  updatePostScoreGetstream
};
