const { UserFollowUser } = require("../databases/models");
const { followMainFeedF2, unFollowMainFeedF2 } = require("../processes/helper");
const processFollow = async (job, done) => {
  console.log("Process follow f2");
  const { data } = job;
  const userId = data.data.userId;
  const targetUserId = data.data.targetUserId;
  // find userIds followed by each userId and targetedUserId
  // follow not followed user(s) by userId to getStream
  const idsToFollow = _findUserIdsToProcess(userId, targetUserId);
  await followMainFeedF2(userId, idsToFollow);

  done();
};

const processUnfollow = async (job, done) => {
  console.log("Process unfollow f2");
  const { data } = job;
  const userId = data.data.userId;
  const targetUserId = data.data.targetUserId;
  // find userIds followed by each userId and targetedUserId
  // un follow not followed user(s) by userId to getStream
  const idsToUnfollow = _findUserIdsToProcess(userId, targetUserId);
  await unFollowMainFeedF2(userId, idsToUnfollow);

  done();
};

const userIdsToProcessByMainFeedF2 = (
  followersIdByUserId,
  followersIdByTargetUserId
) => {
  return followersIdByTargetUserId.filter((id) => {
    const findIdx = followersIdByUserId.findIndex((fid) => id === fid);
    // user followed this user
    return findIdx > -1 ? false : true;
  });
};

const _findUserIdsToProcess = async (userId, targetUserId) => {
  const findFollowersByUserId = UserFollowUser.findAll({
    where: {
      user_id_follower: userId,
    },
    limit: 1000,
  });

  const findFollowersByTargetUserId = UserFollowUser.findAll({
    where: {
      user_id_follower: targetUserId,
    },
    limit: 1000,
  });

  const [followersByUserId, followersByTargetUserId] = await Promise.all([
    findFollowersByUserId,
    findFollowersByTargetUserId,
  ]);

  const followersIdByUserId = followersByUserId.map(
    (el) => el.user_id_followed
  );
  const followersIdByTargetUserId = followersByTargetUserId.map(
    (el) => el.user_id_followed
  );

  const idsToProcess = userIdsToProcessByMainFeedF2(
    followersIdByUserId,
    followersIdByTargetUserId
  );

  return idsToProcess;
};

module.exports = {
  processFollow,
  processUnfollow,
};
