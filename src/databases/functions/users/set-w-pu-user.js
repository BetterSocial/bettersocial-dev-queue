const {User} = require('../../models');

module.exports = async (userId, score) => {
  if (!userId || !score) return null;

  try {
    const result = await User.update({w_pu_user: score}, {where: {user_id: userId}});
    return result;
  } catch (error) {
    console.error(`Failed to update user w pu with id ${userId}: `, error);
    return null;
  }
};
