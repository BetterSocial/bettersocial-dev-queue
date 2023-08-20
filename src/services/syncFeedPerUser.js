const stream = require("getstream");
const { findFollowingUserIds, findF2UserIds, findFollowingTopicByUser, findUnrelatedUserIds } = require("../processes/helper/userIdsToProcess");
const { successResponse, errorResponse } = require('../utils');
const findAnonymousUserId = require('../databases/functions/users/find-anonymous-user-id')

const syncFeedPerUser = async (req, res) => {
  try {
    // sample id = 397e2fee-6af1-4551-9aae-29a7826cd173
    let { userId } = req.params
    await syncFeedPerUserProcess(userId)

    return successResponse(res, "sync data sucesfully", []);
  } catch (error) {
    return errorResponse(res, error.toString(), 500);
  }
}

const getFeedList = async (clientFeed, feedType) => {
  let offset = 0
  const limit = 500
  let is_finish = false
  feedList = []
  console.log("Get feed list")
  while(!is_finish){
    if(feedType == "following"){
      const feeds = await clientFeed.following({offset:offset, limit:limit})
      if(feeds.results.length == 0){
        is_finish = true
      }else{
        feedList = feedList.concat(feeds.results)
        offset += limit
      }
    }else if(feedType == "follower"){
      const feeds = await clientFeed.followers({offset:offset, limit:limit})
      if(feeds.results.length == 0){
        is_finish = true
      }else{
        feedList = feedList.concat(feeds.results)
        offset += limit
      }
    }
    else{
      const feeds = await clientFeed.get({offset:offset, limit:limit})
      if(feeds.results.length == 0){
        is_finish = true
      }else{
        feedList = feedList.concat(feeds.results)
        offset += limit
      }
    }
  }
  return feedList
}

const listFeedFollowing = async (feed, userId) => {
  const client = stream.connect(process.env.API_KEY, process.env.SECRET, process.env.APP_ID);
  const clientFeed = client.feed(feed, userId);
  const feeds = await getFeedList(clientFeed, "following")
  return feeds
}

const listFeedFollower = async (feed, userId) => {
  const client = stream.connect(process.env.API_KEY, process.env.SECRET, process.env.APP_ID);
  const clientFeed = client.feed(feed, userId);
  const feeds = await getFeedList(clientFeed, "follower")
  return feeds
}

const listFeedActivities = async (feed, userId) => {
  const client = stream.connect(process.env.API_KEY, process.env.SECRET, process.env.APP_ID);
  const clientFeed = client.feed(feed, userId);
  const activities = await getFeedList(clientFeed, "activities")
  return activities
}

const getFeedFollowing = async (req, res) => {
  try {
    let { feed, userId } = req.body
    const feedFollowing = await listFeedFollowing(feed, userId)
    const data = {
      total_feed: feedFollowing.length,
      feeds: feedFollowing.map( (feed) => feed.target_id)
    }
    return successResponse(res, "list of following feed", data);
  } catch (error) {
    return errorResponse(res, error.toString(), 500);
  }
}

const getFeedFollower = async (req, res) => {
  try {
    let { feed, userId } = req.body
    const feedFollower = await listFeedFollower(feed, userId)
    const data = {
      total_feed: feedFollower.length,
      feeds: feedFollower.map( (feed) => feed.target_id)
    }
    return successResponse(res, "list of follower feed", data);
  } catch (error) {
    return errorResponse(res, error.toString(), 500);
  }
}

const getFeedActivities = async (req, res) => {
  try {
    let { feed, userId } = req.body
    const activities = await listFeedActivities(feed, userId)
    const data = {
      total_activities: activities.length,
      activities: activities
    }
    return successResponse(res, "list of follower feed", data);
  } catch (error) {
    return errorResponse(res, error.toString(), 500);
  }
}

const unfollowFeed = async (req, res) => {
  try {
    let { userOirigin, feedOrigin, userTarget, feedTarget } = req.body
    const client = stream.connect(process.env.API_KEY, process.env.SECRET, process.env.APP_ID);
    const nameFeed = client.feed(feedOrigin, userOirigin);
    const result = await nameFeed.unfollow(feedTarget, userTarget);

    return successResponse(res, "unfollow feed sucesfully", result);
  } catch (error) {
    return errorResponse(res, error.toString(), 500);
  }
}

const resetAndSyncFeed = async (req, res) => {
  try {
    let { feed, userId } = req.body
    let message = `feed ${feed} sucesfully sync`
    const client = stream.connect(process.env.API_KEY, process.env.SECRET, process.env.APP_ID);
    const clinetFeed = client.feed(feed, userId);

    const followinfFeed = await listFeedFollowing(feed, userId)
    console.log(`Start reset feed ${feed}`)
    await Promise.all(followinfFeed.map( async (feed) => {
      targetFeed = feed.target_id.split(":")
      console.log(targetFeed)
      let result = await clinetFeed.unfollow(targetFeed[0], targetFeed[1]);
      console.log(result)
    }))
    console.log(`End reset feed ${feed}`)
    console.log(`Start sync feed ${feed}`)
    if(feed == "main_feed_following"){
      await syncMainFeedFollowing(userId)
    }else if(feed == "main_feed_f2"){
      await syncMainFeedF2(userId)
    }else if(feed == "main_feed_broad"){
      await syncMainFeedBroad(userId)
    }else{
      message = `feed ${feed} not found`
    }
    console.log(`End sync feed ${feed}`)
    return successResponse(res, message, []);
  } catch (error) {
    return errorResponse(res, error.toString(), 500);
  }
}


const syncMainFeedFollowing = async (userId) => {
    console.log("START sync main_feed_following")
    const followingUser = await findFollowingUserIds(userId)
    await followManyUserFeed(userId,followingUser,'main_feed_following','user_excl')
    const anonUserIds = await Promise.all(followingUser.map(findAnonymousUserId)).then(users => users.filter(user => {
      return user !== undefined;
    }));
    await followManyUserFeed(userId,anonUserIds,'main_feed_following','user_anon')
    const topics = await findFollowingTopicByUser(userId)
    console.log(followingUser, anonUserIds, topics)
    await followManyUserFeed(userId,topics,'main_feed_following','topic')
    console.log("END sync main_feed_following")
}

const syncMainFeedF2 = async (userId) => {
    console.log("START sync main_feed_f2")
    const f2User = await findF2UserIds(userId)
    await followManyUserFeed(userId,f2User,'main_feed_f2','user')
    console.log("END sync main_feed_f2")
}

const syncMainFeedBroad = async (userId) => {
    console.log("START sync main_feed_broad")
    const broads = await findUnrelatedUserIds(userId)
    await followManyUserFeed(userId,broads,'main_feed_broad','user')
    console.log("END sync main_feed_broad")
}


const syncFeedPerUserProcess = async (userId) => {
    console.log(userId)
    // Get following user to follow
    await syncMainFeedFollowing(userId)
    // Get f2 user to follow
    await syncMainFeedF2(userId)
    // Get broad user to follow
    await syncMainFeedBroad(userId)
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
  syncFeedPerUser,
  syncFeedPerUserProcess,
  unfollowFeed,
  getFeedFollowing,
  getFeedFollower,
  getFeedActivities,
  resetAndSyncFeed
}
