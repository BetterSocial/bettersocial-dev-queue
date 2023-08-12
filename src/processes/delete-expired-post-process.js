const moment = require('moment');
const {Op} = require('sequelize');
const {getDb} = require('../config/mongodb_conn');
const {DB_COLLECTION_POST_SCORE} = require('./scoring-constant');
const {Posts} = require('../databases/models');

const deleteExpiredPostProcess = async (job, done, queueInjection) => {
  try {
    const date_ob = new Date();
    const date = `0${date_ob.getDate()}`.slice(-2);
    const month = `0${date_ob.getMonth() + 1}`.slice(-2);
    const year = date_ob.getFullYear();
    // Get list expired post from post_score
    const expired_posts = {};
    const db = await getDb();
    await db
      .collection(DB_COLLECTION_POST_SCORE)
      .find({expired_at: {$lte: `${year}-${month}-${date}`, $ne: ''}})
      .toArray(async (err, docs) => {
        docs.forEach(async (doc) => {
          if (doc.author_id in expired_posts) {
            expired_posts[doc.author_id].push(doc._id);
          } else {
            expired_posts[doc.author_id] = [doc._id];
          }
        });
        if (expired_posts != {}) {
          // Remove from getstream
          for (const [key, value] of Object.entries(expired_posts)) {
            value.forEach(async (act_id) => {
              queueInjection?.add({
                feedName: 'user_excl',
                userId: key,
                activityId: act_id
              });
              await db.collection(DB_COLLECTION_POST_SCORE).deleteOne({_id: act_id});
            });
          }
        }
      });
    await Posts.destroy({
      where: {duration: {[Op.lte]: moment().utc().toISOString()}}
    });
    return done(null, 'OK');
  } catch (error) {
    console.error(`Error deleting expired post: ${error}`);
    return done(null, 'false');
  }
};

module.exports = {
  deleteExpiredPostProcess
};
