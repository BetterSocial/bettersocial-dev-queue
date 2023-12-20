const moment = require('moment');

const calcScoreOnUnfollowUser = async (data, userDoc, followedUserScoreDoc, userScoreList) => {
  console.debug('Starting calcScoreOnUnfollowUser');

  // remove from following, if it's already exist
  const index = userDoc.following.indexOf(data.unfollowed_user_id);
  if (index !== -1) {
    const timestamp = moment().utc().format('YYYY-MM-DD HH:mm:ss');

    userDoc.following.splice(index);
    userDoc.updated_at = timestamp;

    followedUserScoreDoc.F_score_update -= 1;
    followedUserScoreDoc.updated_at = timestamp;
    followedUserScoreDoc.follower = followedUserScoreDoc.follower.filter(
      (item) => item !== data.user_id
    );

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

    console.debug(`Update on unfollow user event: ${JSON.stringify(result)}`);
    return result;
  }
};

module.exports = {
  calcScoreOnUnfollowUser
};
