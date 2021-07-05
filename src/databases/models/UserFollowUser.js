"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class UserFollowUser extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  UserFollowUser.init(
    {
      follow_action: DataTypes.STRING,
      user_id_follower: DataTypes.STRING,
      user_id_followed: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "UserFollowUser",
      tableName: "user_follow_user",
      timestamps: false,
    }
  );
  return UserFollowUser;
};
