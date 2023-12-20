const moment = require('moment');

const calcScoreOnFollowUser = async (data, userDoc, followedUserScoreDoc, userScoreList) => {
  console.debug('Starting calcScoreOnFollowUser');

  // add to following, if it's not exist yet
  if (userDoc.following.indexOf(data.followed_user_id) === -1) {
    const timestamp = moment().utc().format('YYYY-MM-DD HH:mm:ss');

    userDoc.following.push(data.followed_user_id);
    userDoc.updated_at = timestamp;

    followedUserScoreDoc.F_score_update += 1;
    followedUserScoreDoc.updated_at = timestamp;
    followedUserScoreDoc.follower.push(data.user_id);
    const result = await userScoreList.bulkWrite([
      {
        updateOne: {
          filter: {_id: userDoc._id}, // query data to be updated
          update: {
            $set: {
              following: userDoc.following,
              updated_at: userDoc.updated_at
            }
          }, // updates
          upsert: false
        }
      },
      {
        updateOne: {
          filter: {_id: followedUserScoreDoc._id}, // query data to be updated
          update: {
            $set: {
              F_score_update: followedUserScoreDoc.F_score_update,
              follower: followedUserScoreDoc.follower,
              updated_at: followedUserScoreDoc.updated_at
            }
          }, // updates
          upsert: false
        }
      }
    ]);

    console.debug(`Update on follow user event: ${JSON.stringify(result)}`);
    return result;
  }
};

module.exports = {
  calcScoreOnFollowUser
};
