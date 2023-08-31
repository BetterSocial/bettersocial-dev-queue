const { User } = require("../../models")

module.exports = async (userId) => {
    let topics = []
    if(userId == null) return;
    topics = await User.findOne({
        where: {
            user_id: userId
        },
        attributes: ['user_id'],
        include: ['topics'],
    }).then((val) => {
        if(val == null) return
        return val.topics.map((topic)=>{
            return topic.name
        })
    });
    if(topics == null) return []
    return topics
}
