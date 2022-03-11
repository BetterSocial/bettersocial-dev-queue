const moment = require("moment");

const calcScoreOnUnfollowUser = async(data, userDoc, userScoreList) => {
  console.debug("Starting calcScoreOnUnfollowUser");

  // remove from following, if it's already exist
  const index = userDoc.following.indexOf(data.unfollowed_user_id);
  if (index != -1) {
    userDoc.following.splice(index);
    userDoc.updated_at = moment().utc().format("YYYY-MM-DD HH:mm:ss"); // format current time in utc

    const result = await userScoreList.updateOne(
      { _id : userDoc._id }, // query data to be updated
      { $set : {
        following: userDoc.following,
        updated_at: userDoc.updated_at,
      } }, // updates
      { upsert: false } // options
    );

    console.debug("Update on unfollow user event: " + JSON.stringify(result));
    return result;
  }
};

module.exports = {
  calcScoreOnUnfollowUser
}
