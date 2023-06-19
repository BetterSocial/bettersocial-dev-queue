const { UserFollowUser } = require("../databases/models");
const { followMainFeedF2 } = require("../processes/helper");
const processFollow = async (job, done) => {
  UserFollowUser.find;
  const { data } = job;
  const userId = data.data.userId;
  const targetUserId = data.data.targetUserId;
  // find userIds followed by each userId and targetedUserId
  // follow not followed user(s) by userId to getStream

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

  const idsToFollow = userIdsToProcessByMainFeedF2(
    followersIdByUserId,
    followersIdByTargetUserId
  );

  await followMainFeedF2(userId, idsToFollow);

  done();
};

const userIdsToProcessByMainFeedF2 = (
  followersIdByUserId,
  followersIdByTargetUserId
) => {
  return followersIdByTargetUserId.filter((id) => {
    const findIdx = followersIdByUserId.findIndex((fid) => id === fid);
    // user followed this user
    if (findIdx > -1) {
      return false;
    }
    return true;
  });
};

module.exports = {
  processFollow,
};
