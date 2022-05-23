'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class NewsLink extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  NewsLink.init({
    news_link_id: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true,
    },
    news_url: DataTypes.TEXT,
    domain_page_id: DataTypes.BIGINT,
    site_name: DataTypes.STRING,
    title: DataTypes.STRING,
    image: DataTypes.STRING,
    description: DataTypes.TEXT,
    url: DataTypes.TEXT,
    url_compact: DataTypes.TEXT,
    keyword: DataTypes.STRING,
    author: DataTypes.STRING,
    created_at: DataTypes.DATE,
    updated_at: DataTypes.DATE,
    post_id: DataTypes.TEXT,
  }, {
    sequelize,
    modelName: 'NewsLink',
    tableName: "news_link",
    timestamps: false,
  });
  return NewsLink;
};
