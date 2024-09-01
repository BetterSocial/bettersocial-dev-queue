// eslint-disable-next-line no-unused-vars
const {Model} = require('sequelize');
const {sequelize} = require('../../models');

/**
 *
 * @param {Model} fcmTokenModel
 * @param {String} userId
 */
module.exports = async (fcmTokenModel, userId) => {
  const userTargetTokens = sequelize.query(
    'SELECT DISTINCT(token) as token from user_token WHERE user_id = :userId',
    {
      replacements: {
        userId
      },
      raw: true,
      type: sequelize.QueryTypes.SELECT
    }
  );

  return userTargetTokens;
};
