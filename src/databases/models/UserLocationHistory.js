"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class UserLocationHistory extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  UserLocationHistory.init(
    {

      user_id: { type: DataTypes.STRING, allowNull: false, primaryKey: true, },
      location_id: { type: DataTypes.BIGINT, allowNull: false },
      action: { type: DataTypes.STRING, allowNull: false },
      created_at: DataTypes.DATE,
    },
    {
      sequelize,
      modelName: "UserLocationHistory",
      tableName: "user_location_history",
      timestamps: false,
    }
  );
  return UserLocationHistory;
};
