"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class UserFollowUserHistory extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  UserFollowUserHistory.init(
    {
      user_id_follower: { type: DataTypes.STRING, allowNull: false,  primaryKey: true, },
      user_id_followed: { type: DataTypes.BIGINT, allowNull: false },
      action: { type: DataTypes.STRING, allowNull: false },
      source: { type: DataTypes.STRING, allowNull: false },
    },
    {
      sequelize,
      modelName: "UserFollowUserHistory",
      tableName: "user_follow_user_history",
      timestamps: false,
    }
  );
  return UserFollowUserHistory;
};
