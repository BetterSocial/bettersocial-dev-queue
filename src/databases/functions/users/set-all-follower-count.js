const client = require('../../../services/postgres/pool');
const db = require('../../models/');

module.exports = async () => {
  try {
    const query = `
      UPDATE users AS u
      SET followers_count = COALESCE(follower_count, 0)
      FROM (
          SELECT user_id_followed, COUNT(user_id_follower) AS follower_count
          FROM user_follow_user
          WHERE is_anonymous = false
          GROUP BY user_id_followed
      ) AS follower_counts
      WHERE u.user_id = follower_counts.user_id_followed;
    `;

    const result = await db.sequelize.query(query);
    return result;
  } catch (error) {
    console.error(`Failed to set follower count`, error);
    return null;
  }
};
