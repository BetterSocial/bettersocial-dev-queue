const stream = require('getstream');
const moment = require('moment');
const {getDb} = require('../config/mongodb_conn');
const {successResponse, errorResponse} = require('../utils');
const UsersFunction = require('../databases/functions/users');
const {initDataUserScore} = require('../processes/scoring-process');

const {calcScoreOnSyncUserScore} = require('../processes/scoring');
const {
  DB_COLLECTION_USER_SCORE,
  DB_COLLECTION_POST_SCORE,
  DB_COLLECTION_USER_POST_SCORE
} = require('../processes/scoring-constant');

const getListData = async () => {
  const db = await getDb();
  const [userScoreList, postScoreList, userPostScoreList] = await Promise.all([
    db.collection(DB_COLLECTION_USER_SCORE),
    db.collection(DB_COLLECTION_POST_SCORE),
    db.collection(DB_COLLECTION_USER_POST_SCORE)
  ]);

  return {
    userScoreList,
    postScoreList,
    userPostScoreList
  };
};

const setInitialDataUserScore = async (userId, initialUserScoreDoc) => {
  // Get topic that user follow
  const data_user = await UsersFunction.getUserByUserId(userId);
  // console.log("User => ",data_user.createdAt)
  const topics = await UsersFunction.getUserTopicList(userId);
  const following_users = await UsersFunction.getUserFollowingList(userId);

  const scoringProcessData = {
    user_id: userId,
    register_time: data_user.createdAt, // moment().format("YYYY-MM-DD HH:mm:ss"),
    emails: [],
    twitter_acc: '',
    topics,
    follow_users: following_users
  };

  const {userScoreList} = await getListData();
  let userDoc = await userScoreList.findOne({_id: data_user.user_id});
  console.debug(`findOne userDoc result: ${JSON.stringify(userDoc)}`);
  if (!userDoc) {
    console.debug('init user score doc');
    userDoc = initialUserScoreDoc;
    console.debug(`initUser Score : ${JSON.stringify(userDoc)}`);
  }

  const result = await calcScoreOnSyncUserScore(scoringProcessData, userDoc, userScoreList);
  return result;
};

const syncUserScore = async (req, res) => {
  try {
    // sample id = 397e2fee-6af1-4551-9aae-29a7826cd173
    const {userId} = req.body;
    const result = await setInitialDataUserScore(userId);
    return successResponse(res, 'sync data sucesfully', result);
  } catch (error) {
    console.log(error);
    return errorResponse(res, error.toString(), 500);
  }
};

module.exports = {
  syncUserScore,
  setInitialDataUserScore
};
