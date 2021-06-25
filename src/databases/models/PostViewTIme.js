"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class PostViewTime extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  PostViewTime.init(
    {
      post_id: {
        type: DataTypes.UUID,
        allowNull: false,
        primaryKey: true,
      },
      user_id: DataTypes.STRING,
      view_time: DataTypes.BIGINT,
    },
    {
      sequelize,
      modelName: "PostViewTime",
      tableName: "post_view_time",
      timestamps: false,
    }
  );
  return PostViewTime;
};
