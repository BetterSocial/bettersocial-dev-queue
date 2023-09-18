const { raw } = require("body-parser");
const { UserFollowUser } = require("../../models");

module.exports = async (userId) => {
  let user_follower = [];
  if (userId == null) return [];
  user_follower = await UserFollowUser.findAll({
    where: {
      user_id_followed: userId,
    },
    attributes: ["user_id_follower"],
    raw: true,
  }).then((users) => users.map((user) => user.user_follower));
  if (user_follower == null) return [];
  return user_follower;
};
