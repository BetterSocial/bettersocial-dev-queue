const moment = require('moment');
const {getDb} = require('../../config/mongodb_conn');
const {DB_COLLECTION_USER_SCORE} = require('../scoring-constant');

const getListData = async () => {
  const db = await getDb();
  const [userScoreList] = await Promise.all([db.collection(DB_COLLECTION_USER_SCORE)]);

  return {
    userScoreList
  };
};

const updateUserBlockStatus = async (userId, is_blocked) => {
  const {userScoreList} = await getListData();
  const updateResult = await userScoreList.updateOne(
    {_id: userId}, // query data to be updated
    {
      $set: {
        blocked_by_admin: {
          status: is_blocked,
          last_update: moment.utc().format('YYYY-MM-DD HH:mm:ss')
        }
      }
    }, // updates
    {upsert: false} // options
  );
  return updateResult;
};

const adminBlockUserProcess = async (userId) => {
  const result = await updateUserBlockStatus(userId, true);
  return result;
};
const adminUnblockUserProcess = async (userId) => {
  const result = await updateUserBlockStatus(userId, false);
  return result;
};

module.exports = {
  adminBlockUserProcess,
  adminUnblockUserProcess
};
