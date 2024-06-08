'use strict';
const {Model} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class CommunityMessageFormat extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(_models) {
      // define association here
    }
  }
  CommunityMessageFormat.init(
    {
      community_message_format_id: {
        type: DataTypes.STRING,
        allowNull: false,
        primaryKey: true
      },
      user_id: {type: DataTypes.STRING, allowNull: false},
      topic_id: {type: DataTypes.BIGINT, allowNull: false},
      message: {type: DataTypes.TEXT, allowNull: false},
      delay_time: {type: DataTypes.INTEGER, allowNull: false},
      createdAt: {
        type: DataTypes.DATE,
        field: 'created_at',
        allowNull: false
      },
      updatedAt: {
        type: DataTypes.DATE,
        field: 'updated_at',
        allowNull: false
      }
    },
    {
      sequelize,
      modelName: 'CommunityMessageFormat',
      tableName: 'community_message_format'
    }
  );
  return CommunityMessageFormat;
};
