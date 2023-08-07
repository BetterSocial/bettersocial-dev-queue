const stream = require("getstream");
const { findFollowingUserIds, findF2UserIds, findFollowingTopicByUser, findUnrelatedUserIds } = require("../processes/helper/userIdsToProcess");
const { successResponse, errorResponse } = require('../utils');
const syncFeedPerUser = async (req, res) => {
  try {
    // sample id = 397e2fee-6af1-4551-9aae-29a7826cd173
    let { userId } = req.params
    await syncFeedProcess(userId)

    return successResponse(res, "sync data sucesfully", []);
  } catch (error) {
    return errorResponse(res, error.toString(), 500);
  }
}

const syncFeedProcess = async (userId) => {
    console.log(userId)
    // Get following user to follow
    console.log("START sync main_feed_following")
    const followingUser = await findFollowingUserIds(userId)
    await followManyUserFeed(userId,followingUser,'main_feed_following','user')
    console.log("END sync main_feed_following")
    // Get f2 user to follow
    console.log("START sync main_feed_f2")
    const f2User = await findF2UserIds(userId)
    await followManyUserFeed(userId,f2User,'main_feed_f2','user')
    console.log("END sync main_feed_f2")
    // Get topics to follow
    console.log("START sync main_feed_topic")
    const topics = await findFollowingTopicByUser(userId)
    await followManyUserFeed(userId,topics,'main_feed_topic','topic')
    console.log("END sync main_feed_topic")
    // Get broad user to follow
    // console.log("START sync main_feed_broad")
    // const broads = await findUnrelatedUserIds(userId)
    // await followManyUserFeed(userId,broads,'main_feed_broad')
    // console.log("END sync main_feed_broad")
}

const followManyUserFeed = async (userId, userIdsToFollow, originFeed, targetFeed) => {
  if (!userIdsToFollow || userIdsToFollow.length == 0) {
    return;
  }
  const cs = stream.connect(process.env.API_KEY, process.env.SECRET);

  const payload = userIdsToFollow.map((ui) => {
    return {
      source: `${originFeed}:${userId}`,
      target: `${targetFeed}:${ui}`,
    };
  });

  return await cs.followMany(payload);
}

module.exports = {
  syncFeedPerUser
}
