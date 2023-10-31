const {User} = require('../../models');

module.exports = async (userId) => {
  if (userId == null) return null;
  const result = await User.update({blocked_by_admin: true}, {where: {user_id: userId}});
  return result;
};
