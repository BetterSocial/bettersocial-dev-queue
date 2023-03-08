"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class UserLocation extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      models.UserLocation.belongsToMany(models.User, {
        through: "user_location",
        foreignKey: "user_location_id",
        as: "users",
      });
      models.UserLocation.hasMany(models.Locations, {
        foreignKey: "location_id",
        as: "locations",
      });
    }
  }
  UserLocation.init(
    {
      user_location_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      user_id: { type: DataTypes.STRING, allowNull: false },
      location_id: { type: DataTypes.BIGINT, allowNull: false },
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
      modelName: "UserLocation",
      tableName: "user_location",
    }
  );
  return UserLocation;
};
