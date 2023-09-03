const { Posts } = require("../../models")

module.exports = async (postId) => {
    if(postId == null) return;
    post = await Posts.findOne({
        where: {
            post_id: postId
        }
    })
    if(post == null) return []
    return post
}
