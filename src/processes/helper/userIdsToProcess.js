const { UserFollowUser, UserBlockedUser, User, UserTopic, Topics } = require("../../databases/models");
const { Op } = require("sequelize");

const findFollowingUserIds = async (userId) => {
  const followedByUserId = await UserFollowUser.findAll({
    where: {
      user_id_follower: userId,
    },
    limit: 1000,
    attributes: ['user_id_followed'],
    raw : true
  }).then( users => users.map(user => user.user_id_followed));
  // follow self exclusive feed
  followedByUserId.push(userId)

  return followedByUserId;
}

const findF2UserIds = async (userId) => {
  const followedUserIds = await findFollowingUserIds(userId);
  const blockedUserIds = await findBlockedUserIds(userId);
  const excludeUserIds = followedUserIds.concat(blockedUserIds);
  const f2UserIds = await UserFollowUser.findAll({
    where: {
      [Op.and]: [
        { user_id_follower: { [Op.in]:followedUserIds} },
        { user_id_followed: { [Op.notIn]: excludeUserIds } }
      ]
    },
    limit: 1000,
    attributes: ['user_id_followed'],
    raw : true
  }).then( users => users.map(user => user.user_id_followed));

  return f2UserIds
}

const findBlockedUserIds = async (userId) => {
  const blockedUserIds = await UserBlockedUser.findAll({
    where: {
      user_id_blocker: userId,
    },
    limit: 1000,
    attributes: ['user_id_blocked'],
    raw : true
  }).then( users => users.map(user => user.user_id_blocked));

  return blockedUserIds
}

const findRelatedUserIds = async (userId) => {
  const [followedByUserId, f2UserIds, blockedUserIds] = await Promise.all([
    findFollowingUserIds(userId),
    findF2UserIds(userId),
    findBlockedUserIds(userId),
  ]);

  let listUser = [...followedByUserId, ...f2UserIds, ...blockedUserIds];
  let listUniqueUser = [...new Set(listUser)]
  return listUniqueUser
}

const findUnrelatedUserIds = async (userId) => {
  const relatedUserIds = await findRelatedUserIds(userId)
  const unrelatedUserIds = await User.findAll({
    where: {
      user_id: { [Op.notIn]: relatedUserIds }
    },
    limit: 1000,
    attributes: ['user_id'],
    raw : true
  }).then( users => users.map(user => user.user_id));

  return unrelatedUserIds
}

const findFollowingTopicByUser = async (userId) => {
  // TODO
  // Simplify this logic using model associate
  const followingTopicByUser = await UserTopic.findAll({
    where: {
      user_id: userId,
    },
    limit: 1000,
    attributes: ['topic_id'],
    raw : true
  }).then( topics => topics.map(topic => topic.topic_id ));

  const topicList = await Topics.findAll({
    where: {
      topic_id: { [Op.in]: followingTopicByUser },
    },
    limit: 1000,
    attributes: ['name'],
    raw : true
  }).then( topics => topics.map(topic => topic.name ));

  return topicList;
}


module.exports = {
  findFollowingUserIds,
  findF2UserIds,
  findBlockedUserIds,
  findRelatedUserIds,
  findUnrelatedUserIds,
  findFollowingTopicByUser
};
