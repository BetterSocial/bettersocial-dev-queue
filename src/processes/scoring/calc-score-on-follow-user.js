const moment = require("moment");

const calcScoreOnFollowUser = async(data, userDoc, userScoreList) => {
  console.debug("Starting calcScoreOnFollowUser");

  // add to following, if it's not exist yet
  if (userDoc.following.indexOf(data.followed_user_id) == -1) {
    userDoc.following.push(data.followed_user_id);
    userDoc.updated_at = moment().utc().format("YYYY-MM-DD HH:mm:ss"); // format current time in utc

    const result = await userScoreList.updateOne(
      { _id : userDoc._id }, // query data to be updated
      { $set : {
        following: userDoc.following,
        updated_at: userDoc.updated_at,
      } }, // updates
      { upsert: false } // options
    );

    console.debug("Update on follow user event: " + JSON.stringify(result));
    return result;
  }
};

module.exports = {
  calcScoreOnFollowUser
}
