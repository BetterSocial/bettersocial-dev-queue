"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class PostBlocked extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  PostBlocked.init(
    {
      post_id: {
        type: DataTypes.UUID,
        allowNull: false,
        primaryKey: true,
      },
      user_id: { type: DataTypes.STRING },
      created_at: DataTypes.DATE,
      updated_at: DataTypes.DATE,
    },
    {
      sequelize,
      modelName: "PostBlocked",
      tableName: "post_blocked",
      timestamps: false,
    }
  );
  return PostBlocked;
};
