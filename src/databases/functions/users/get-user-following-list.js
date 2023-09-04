const { raw } = require("body-parser");
const { UserFollowUser } = require("../../models")

module.exports = async (userId) => {
    let user_following = []
    if(userId == null) return;
    user_following = await UserFollowUser.findAll({
        where: {
            user_id_follower: userId
        },
        attributes: ['user_id_followed'],
        raw: true
    }).then(users => users.map(user => user.user_id_followed));
    if(user_following == null) return []
    return user_following
}
