const {User} = require('../../models');

module.exports = async (userId) => {
  if (userId == null) return;
  const user = await User.findOne({
    where: {
      user_id: userId
    },
    raw: true
  });
  if (user == null) return;

  return user;
};
