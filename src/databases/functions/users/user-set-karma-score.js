const {User} = require('../../models');

module.exports = async (userId, combined_user_score, karma_score) => {
  if (!userId) return null;
  try {
    const result = await User.update(
      {combined_user_score, karma_score},
      {where: {user_id: userId}}
    );
    return result;
  } catch (error) {
    console.error(`Failed to set karma score user with id ${userId}: `, error);
    return null;
  }
};
