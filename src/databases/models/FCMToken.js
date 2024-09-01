'use strict';
const {Model} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class FCMToken extends Model {}

  FCMToken.init(
    {
      user_id: {type: DataTypes.UUID, allowNull: false, primaryKey: true},
      token: {type: DataTypes.STRING, allowNull: true, unique: true},
      created_at: {type: DataTypes.DATE, allowNull: false},
      updated_at: {type: DataTypes.DATE, allowNull: false}
    },
    {
      sequelize,
      modelName: 'FcmToken',
      tableName: 'user_token',
      underscored: true
    }
  );
  return FCMToken;
};
