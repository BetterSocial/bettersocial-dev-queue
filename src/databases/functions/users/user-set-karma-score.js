const {User} = require('../../models');
const {QueryTypes} = require('sequelize');
const db = require('../../models/');

module.exports = async (userId, combined_user_score, karma_score) => {
  if (!userId) return null;
  try {
    let total_follower = 0;
    const queryTotalFollower = `
      SELECT user_id_followed, COUNT(user_id_follower) AS follower_count
      FROM user_follow_user
      WHERE
      is_anonymous = false
      AND user_id_followed = :userId
      GROUP BY user_id_followed
    `;

    const resultTotalFollower = await db.sequelize.query(queryTotalFollower, {
      type: QueryTypes.SELECT,
      replacements: {
        userId
      },
      raw: true
    });

    if (queryTotalFollower.length > 0) {
      total_follower = resultTotalFollower[0]?.follower_count;
    }

    const result = await User.update(
      {combined_user_score, karma_score, followers_count: total_follower},
      {where: {user_id: userId}}
    );
    return result;
  } catch (error) {
    console.error(`Failed to set karma score user with id ${userId}: `, error);
    return null;
  }
};
