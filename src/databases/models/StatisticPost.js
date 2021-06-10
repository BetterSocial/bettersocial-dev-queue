"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class StatisticPost extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  StatisticPost.init(
    {
      id_statistic: {
        type: DataTypes.UUID,
        allowNull: false,
        primaryKey: true,
      },
      user_id: { type: DataTypes.STRING },
      counter: DataTypes.NUMBER,
      date: DataTypes.DATEONLY,
      created_at: DataTypes.DATE,
      updated_at: DataTypes.DATE,
    },
    {
      sequelize,
      modelName: "StatisticPost",
      tableName: "statistic_post",
      timestamps: false,
    }
  );
  return StatisticPost;
};
