"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Posts extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Posts.init(
    {
      post_id: {
        type: DataTypes.UUID,
        allowNull: false,
        primaryKey: true,
      },
      author_user_id: DataTypes.STRING,
      anonymous: DataTypes.BOOLEAN,
      parent_post_id: DataTypes.STRING,
      audience_id: DataTypes.STRING,
      duration: DataTypes.STRING,
      visibility_location_id: DataTypes.STRING,
      post_content: DataTypes.STRING,
      created_at: DataTypes.DATE,
      updated_at: DataTypes.DATE,
    },
    {
      sequelize,
      modelName: "Posts",
      tableName: "posts",
      timestamps: false,
    }
  );
  return Posts;
};
