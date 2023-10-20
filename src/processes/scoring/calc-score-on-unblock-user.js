const moment = require('moment');
const {calcUserPostScore} = require('./calc-user-post-score');
const {calcPostScore} = require('./calc-post-score');
const {isStringBlankOrNull, postInteractionPoint} = require('../../utils');
const REGULAR_TIME_FORMAT = 'YYYY-MM-DD HH:mm:ss';

const calcScoreOnUnblockUser = async (data, userScoreDoc, blockedUserScoreDoc, connectionList) => {
  console.debug('Starting calcScoreOnUnblockUserPost');
  // Check whether the user has blocked the author (possible reprocess), by looking at the blocking list in user score doc
  if (userScoreDoc.blocking?.includes(blockedUserScoreDoc._id)) {
    console.debug('User ' + blockedUserScoreDoc._id + ' is blocked by user ' + userScoreDoc._id);

    // Delete the author in blocking list
    userScoreDoc.blocking = userScoreDoc.blocking.filter((id) => id !== blockedUserScoreDoc._id);

    let updated_at = moment().utc().format(REGULAR_TIME_FORMAT); // format current time in utc
    let sum_BP_score_update = blockedUserScoreDoc.sum_BP_score_update - 1;
    sum_BP_score_update = sum_BP_score_update === 0 ? 1 : sum_BP_score_update;

    const [result] = await Promise.all([
      connectionList.userScoreList.updateOne(
        {_id: blockedUserScoreDoc._id}, // query data to be updated
        {
          $set: {
            sum_BP_score_update: sum_BP_score_update,
            updated_at: updated_at
          }
        }, // updates
        {upsert: false} // options
      ),

      connectionList.userScoreList.updateOne(
        {_id: userScoreDoc._id}, // query data to be updated
        {
          $set: {
            blocking: userScoreDoc.blocking,
            updated_at: updated_at
          }
        }, // updates
        {upsert: false} // options
      )
    ]);

    return result;
  } else {
    console.debug(
      'Skipping unblock user ' + blockedUserScoreDoc._id + ' as blocked by user ' + userScoreDoc._id
    );
  }
};

module.exports = {
  calcScoreOnUnblockUser
};
