const {successResponse} = require('../../utils');
const {v4: uuidv4} = require('uuid');
const {UserFollowUser, UserFollowUserHistory} = require('../../databases/models');
const UsersFunction = require('../../databases/functions/users');

const autoFollowUserAnon = async (req, res) => {
  try {
    const userFollowUserList = await UserFollowUser.findAll({
      where: {
        is_anonymous: false
      }
    });

    const userFollowerAnonData = [];
    const userFollowerAnonDataHistory = [];
    await Promise.all(
      userFollowUserList.map(async (followUser) => {
        const anonId = await UsersFunction.findAnonymousUserId(followUser.user_id_followed);

        const [followAnonUser, isUnfollowByUser] = await Promise.all([
          UserFollowUser.findOne({
            where: {
              user_id_follower: followUser.user_id_follower,
              user_id_followed: anonId,
              is_anonymous: true
            }
          }),
          UserFollowUserHistory.findOne({
            where: {
              user_id_follower: followUser.user_id_follower,
              user_id_followed: anonId,
              action: 'out'
            }
          })
        ]);

        if (!followAnonUser && !isUnfollowByUser) {
          userFollowerAnonData.push({
            follow_action_id: uuidv4(),
            user_id_follower: followUser.user_id_follower,
            user_id_followed: anonId,
            is_anonymous: true
          });

          userFollowerAnonDataHistory.push({
            user_id_follower: followUser.user_id_follower,
            user_id_followed: anonId,
            action: 'in',
            source: `script`
          });
        }
      })
    );

    let returnUserFollowUser = await UserFollowUser.bulkCreate(userFollowerAnonData);
    await UserFollowUserHistory.bulkCreate(userFollowerAnonDataHistory);

    return successResponse(res, 'Success Follow Anon Users', returnUserFollowUser);
  } catch (error) {
    console.log(error);
    return errorResponse(res, error.toString(), 500);
  }
};

module.exports = {
  autoFollowUserAnon
};
