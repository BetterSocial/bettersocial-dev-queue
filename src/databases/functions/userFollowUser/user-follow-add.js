const { v4: uuidv4 } = require("uuid")

/**
 * 
 * @param {Model} model 
 * @param {RegisterBodyData.Users} users 
 */
module.exports = async (userFollowUserModel, userFollowUserHistoryModel, userId, followedUsers = [], followSource, transaction = null) => {
    if(followedUsers.length === 0) return;
    // User Follow User
    let follows_array_return = followedUsers.map((val) => {
        return {
            //   generate UUID
            follow_action_id: uuidv4(),
            user_id_follower: userId,
            user_id_followed: val,
        };
    });

    let returnUserFollowUser = await userFollowUserModel.bulkCreate(
        follows_array_return,
        {
            transaction,
            returning: true,
            raw: true,
        }
    );

    if (returnUserFollowUser.length > 0) {
        let user_follow_user_return = returnUserFollowUser.map((val) => {
            return {
                user_id_follower: val.user_id_follower,
                user_id_followed: val.user_id_followed,
                action: "in",
                source: followSource,
            };
        });
        await userFollowUserHistoryModel.bulkCreate(user_follow_user_return, {
            transaction,
        });
    }

    return returnUserFollowUser;
}