"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class PostStatistic extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  PostStatistic.init(
    {
      post_id: {
        type: DataTypes.UUID,
        allowNull: false,
        primaryKey: true,
      },
      view_count: { type: DataTypes.BIGINT },
      upvote_count: { type: DataTypes.BIGINT },
      downvote_count: { type: DataTypes.BIGINT },
      block_count: { type: DataTypes.BIGINT },
      shared_count: { type: DataTypes.BIGINT },
      comment_count: { type: DataTypes.BIGINT },
      created_at: DataTypes.DATE,
      updated_at: DataTypes.DATE,
    },
    {
      sequelize,
      modelName: "PostStatistic",
      tableName: "post_statistic",
      timestamps: false,
    }
  );
  return PostStatistic;
};
