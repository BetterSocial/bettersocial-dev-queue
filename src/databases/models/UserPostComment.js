"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class UserPostComment extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  UserPostComment.init(
    {
      id: {
        type: DataTypes.UUID,
        allowNull: false,
        primaryKey: true,
      },
      post_id: DataTypes.UUID,
      comment_id: DataTypes.UUID,
      author_user_id: DataTypes.UUID,
      commenter_user_id: DataTypes.UUID,
      comment: { type: DataTypes.STRING },
      created_at: DataTypes.DATE,
      updated_at: DataTypes.DATE,
    },
    {
      sequelize,
      modelName: "UserPostComment",
      tableName: "user_post_comment",
      timestamps: false,
    }
  );
  return UserPostComment;
};
