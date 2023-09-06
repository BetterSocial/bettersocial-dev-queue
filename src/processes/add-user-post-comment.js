const Bull = require('bull')
const { sequelize, UserPostComment } = require('../databases/models')
const { v4: uuid } = require('uuid')

require('dotenv').config()

/**
 * @typedef {Object} UserPostComment
 * @property {string} postId 
 * @property {string} commentId 
 * @property {string} authorUserId
 * @property {string} commenterUserId
 * @property {string} comment
 */


/**
 * 
 * @param {Bull.Job<UserPostComment>} job 
 * @param {Bull.DoneCallback} done 
 * @returns 
 */
const addUserPostCommentProcess = async (job, done) => {
    // let success = await sequelize.query("REFRESH MATERIALIZED VIEW vwm_user_common_follower_count")
    // if(success) return done(null, 'OK')
    let { postId, parentCommentId, isAnonymous, comment, commentId, commenterUserId, authorUserId } = job?.data
    console.log('job?.data')
    console.log(job?.data)
    await UserPostComment.create({
        id: uuid(),
        post_id: postId,
        parent_comment_id: parentCommentId,
        comment_id: commentId,
        author_user_id: authorUserId,
        commenter_user_id: commenterUserId,
        is_anonymous: isAnonymous,
        comment
    })

    return done(null, 'false')
}

module.exports = {
    addUserPostCommentProcess
}