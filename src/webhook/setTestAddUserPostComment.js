const {
    dailyCredderUpdateQueue, addUserPostCommentQueue
} = require("../config");
const { dateCreted } = require("../utils");
const setTestAddUserPostComment = async (req, res) => {
    try {
        /**
         * @type {import("../processes/add-user-post-comment").UserPostComment}
         */
        const body = req?.body
        const { authorUserId, comment, commentId, commenterUserId, postId } = body
        const result = await addUserPostCommentQueue.add({
            authorUserId,
            comment,
            commentId,
            postId,
            commenterUserId
        })


        return res.json({
            status: 'ok',
            result: result,
        })
    } catch (error) {
        console.error("error");
        console.error(error);
        return res.json({
            ststus: "error",
            message: error,
        });
    }

};

module.exports = { setTestAddUserPostComment };
