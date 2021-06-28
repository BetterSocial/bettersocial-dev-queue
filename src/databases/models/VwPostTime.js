"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class VwPostTime extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  VwPostTime.init(
    {
      post_id: DataTypes.STRING,
      average: DataTypes.BIGINT,
    },
    {
      sequelize,
      modelName: "VwPostTime",
      tableName: "vw_post_time",
      timestamps: false,
    }
  );
  return VwPostTime;
};
