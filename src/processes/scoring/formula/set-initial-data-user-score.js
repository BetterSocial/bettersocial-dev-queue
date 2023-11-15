const {getDb} = require('../../../config/mongodb_conn');
const UsersFunction = require('../../../databases/functions/users');

const {calcScoreOnSyncUserScore} = require('../../../processes/scoring');
const {DB_COLLECTION_USER_SCORE} = require('../../../processes/scoring-constant');

const {initDataUserScore} = require('./initial-score-value');

const getListData = async () => {
  const db = await getDb();
  const [userScoreList] = await Promise.all([db.collection(DB_COLLECTION_USER_SCORE)]);

  return {
    userScoreList
  };
};

const setInitialDataUserScore = async (userId) => {
  const data_user = await UsersFunction.getUserByUserId(userId);
  const topics = await UsersFunction.getUserTopicList(userId);
  const following_users = await UsersFunction.getUserFollowingList(userId);

  const scoringProcessData = {
    user_id: userId,
    register_time: data_user?.createdAt,
    emails: [],
    twitter_acc: '',
    topics,
    follow_users: following_users
  };
  const {userScoreList} = await getListData();
  let userDoc = await userScoreList.findOne({
    _id: userId
  });
  console.log('DEBUG => ', userDoc);
  console.debug(`findOne userDoc result: ${JSON.stringify(userDoc)}`);
  if (!userDoc) {
    console.debug('init user score doc');
    userDoc = initDataUserScore(userId, data_user?.createdAt);
    console.debug(`initUser Score : ${JSON.stringify(userDoc)}`);
  }

  const result = await calcScoreOnSyncUserScore(scoringProcessData, userDoc, userScoreList);
  return result;
};

module.exports = {
  setInitialDataUserScore
};
