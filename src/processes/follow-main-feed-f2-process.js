const {UserFollowUser, UserBlockedUser} = require('../databases/models');
const {followMainFeedF2, unFollowMainFeedF2} = require('./helper');
// const {updateMainFeedBroadProcessQueue} = require('../config');

const userIdsToProcessByMainFeedF2 = (
  userId,
  followersIdByUserId,
  followersIdByTargetUserId,
  blockedUsersIdByUserId
) => {
  return followersIdByTargetUserId.filter((id) => {
    const findIdx = followersIdByUserId.findIndex((fid) => id === fid);
    const findIdfromBlockedUser = blockedUsersIdByUserId.findIndex((fid) => id === fid);
    // user followed this user
    return !!(findIdx < 0 && findIdfromBlockedUser < 0 && id !== userId);
  });
};

const findUserIdsToProcess = async (userId, targetUserId) => {
  const findFollowersByUserId = UserFollowUser.findAll({
    where: {
      user_id_follower: userId
    },
    limit: 1000
  });

  const findFollowersByTargetUserId = UserFollowUser.findAll({
    where: {
      user_id_follower: targetUserId
    },
    limit: 1000
  });

  const findBlockedUsersByUserId = UserBlockedUser.findAll({
    where: {
      user_id_blocker: userId
    },
    limit: 1000
  });

  const [followersByUserId, followersByTargetUserId, blockedUsersByUserId] = await Promise.all([
    findFollowersByUserId,
    findFollowersByTargetUserId,
    findBlockedUsersByUserId
  ]);

  const followersIdByUserId = followersByUserId.map((el) => el.user_id_followed);
  const followersIdByTargetUserId = followersByTargetUserId.map((el) => el.user_id_followed);
  const blockedUsersIdByUserId = blockedUsersByUserId.map((el) => el.user_id_blocked);

  const idsToProcess = userIdsToProcessByMainFeedF2(
    userId,
    followersIdByUserId,
    followersIdByTargetUserId,
    blockedUsersIdByUserId
  );

  return idsToProcess;
};

const processFollow = async (job, done) => {
  console.log('Process follow f2');
  const {data} = job;
  const {userId} = data.data;
  const {targetUserId} = data.data;
  // find userIds followed by each userId and targetedUserId
  // follow not followed user(s) by userId to getStream
  const idsToFollow = await findUserIdsToProcess(userId, targetUserId);
  await followMainFeedF2(userId, idsToFollow);
  // create job to update broad feed
  // updateMainFeedBroadProcessQueue.add({userId});
  done();
};

const processUnfollow = async (job, done) => {
  console.log('Process unfollow f2');
  const {data} = job;
  const {userId} = data.data;
  const {targetUserId} = data.data;
  // find userIds followed by each userId and targetedUserId
  // un follow not followed user(s) by userId to getStream
  const idsToUnfollow = await findUserIdsToProcess(userId, targetUserId);
  await unFollowMainFeedF2(userId, idsToUnfollow);
  // create job to update broad feed
  // updateMainFeedBroadProcessQueue.add({userId});
  done();
};

module.exports = {
  processFollow,
  processUnfollow
};
