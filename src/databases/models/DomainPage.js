"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class DomainPage extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  DomainPage.init(
    {
      domain_page_id: {
        type: DataTypes.UUID,
        allowNull: false,
        primaryKey: true,
      },
      domain_name: { type: DataTypes.STRING },
      logo: DataTypes.STRING,
      short_description: DataTypes.TEXT,
      created_at: DataTypes.DATE,
      updated_at: DataTypes.DATE,
    },
    {
      sequelize,
      modelName: "DomainPage",
      tableName: "domain_page",
      timestamps: false,
    }
  );
  return DomainPage;
};
