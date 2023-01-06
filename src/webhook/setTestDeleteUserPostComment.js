const {
    deleteActivityProcessQueue, deleteUserPostCommentQueue
} = require("../config");
const setTestDeleteUserPostComment = async (req, res) => {
    try {
        /**
         * @type {import("../processes/add-user-post-comment").UserPostComment}
         */
        const body = req?.body
        const { authorUserId, commenterUserId } = body
        const result = await deleteUserPostCommentQueue.add({
            authorUserId,
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

module.exports = { setTestDeleteUserPostComment };
