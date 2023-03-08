"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class UserTopic extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  UserTopic.init(
    {
      user_topics_id: {
        type: DataTypes.STRING,
        allowNull: false,
        primaryKey: true,
      },
      user_id: { type: DataTypes.STRING, allowNull: false },
      topic_id: { type: DataTypes.BIGINT, allowNull: false },
      createdAt: {
        type: DataTypes.DATE,
        field: "created_at",
        allowNull: false,
      },
      updatedAt: {
        type: DataTypes.DATE,
        field: "updated_at",
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "UserTopic",
      tableName: "user_topics",
    }
  );
  return UserTopic;
};
