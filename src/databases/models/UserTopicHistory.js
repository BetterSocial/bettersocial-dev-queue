"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class UserTopicHistory extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  UserTopicHistory.init(
    {
      user_id: { type: DataTypes.STRING, allowNull: false,  primaryKey: true, },
      topic_id: { type: DataTypes.BIGINT, allowNull: false },
      action: { type: DataTypes.STRING, allowNull: false },
      created_at: DataTypes.DATE,
    },
    {
      sequelize,
      modelName: "UserTopicHistory",
      tableName: "user_topic_history",
      timestamps: false,
    }
  );
  return UserTopicHistory;
};
