const Bull = require('bull')
const { sequelize, UserPostComment } = require('../databases/models')
const { v4: uuid } = require('uuid')
const { deleteReaction } = require('../getstream/deleteReactions')

require('dotenv').config()

/**
 * @typedef {Object} DeleteUserPostComment
 * @property {string} authorUserId
 * @property {string} commenterUserId
 */

/**
 * 
 * @param {Bull.Job<UserPostComment>} job 
 * @param {Bull.DoneCallback} done 
 * @returns 
 */
const deleteUserPostCommentProcess = async (job, done) => {
    let { commenterUserId, authorUserId } = job?.data
    let response = await UserPostComment.findAll({
        where: {
            author_user_id: authorUserId,
            commenter_user_id: commenterUserId
        },
        fields: ["comment_id"]
    })

    response?.map(async (item) => {
        try {
            let deleteReactionSuccess = await deleteReaction(item?.comment_id)
            if (deleteReactionSuccess) {
                let success = await item.destroy()
            }
        } catch (e) {
            console.log('e')
            console.log(e)
        }
    })

    return done(null, 'false')
}

module.exports = {
    deleteUserPostCommentProcess
}