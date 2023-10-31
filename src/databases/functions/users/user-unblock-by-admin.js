const {User} = require('../../models');

module.exports = async (userId) => {
  if (!userId) return null;
  try {
    const result = await User.update({blocked_by_admin: false}, {where: {user_id: userId}});
    return result;
  } catch (error) {
    console.error(`Failed to unblock user with id ${userId}: `, error);
    return null;
  }
};
