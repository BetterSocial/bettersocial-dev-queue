"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Locations extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      models.Locations.belongsToMany(models.User, {
        through: "user_location",
        foreignKey: "location_id",
        as: "users",
      });
    }
  }
  Locations.init(
    {
      location_id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
      },
      zip: DataTypes.STRING,
      neighborhood: DataTypes.STRING,
      city: DataTypes.STRING,
      state: DataTypes.STRING,
      country: DataTypes.STRING,
      location_level: DataTypes.STRING,
      status: DataTypes.STRING,
      slug_name: DataTypes.TEXT,
      createdAt: {
        type: DataTypes.DATE,
        field: "created_at",
      },
      updatedAt: {
        type: DataTypes.DATE,
        field: "updated_at",
      },
    },
    {
      sequelize,
      modelName: "Locations",
      tableName: "location",
      underscored: true,
    }
  );
  return Locations;
};
