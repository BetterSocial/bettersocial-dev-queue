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
      follow_action_id: {
        type: DataTypes.STRING,
        allowNull: false,
        primaryKey: true,
      },
      user_id_follower: { type: DataTypes.UUID, allowNull: false },
      user_id_followed: { type: DataTypes.UUID, allowNull: false },
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
