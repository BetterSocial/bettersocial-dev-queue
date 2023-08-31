const { User } = require("../../models")

module.exports = async (userId) => {
    if(userId == null) return;
    user = await User.findOne({
        where: {
            user_id: userId
        }
    })
    if(user == null) return []
    return user
}
