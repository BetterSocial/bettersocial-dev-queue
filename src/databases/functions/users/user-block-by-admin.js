const {User} = require('../../models');

module.exports = async (userId) => {
  if (!userId) return null;
  try {
    const result = await User.update({blocked_by_admin: true}, {where: {user_id: userId}});
    return result;
  } catch (error) {
    console.error(`Failed to block user with id ${userId}: `, error);
    return null;
  }
};
