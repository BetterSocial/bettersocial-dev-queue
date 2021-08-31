"use strict";
const {Model} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class UserScore extends Model {
        static associate(models) {}
    }

    UserScore.init({
        user_score_id : {
            type : DataTypes.UUID,
            allowNull : false,
            primaryKey : true
        },
        user_id : { type : DataTypes.UUID, allowNull : false},
        user_score : { type : DataTypes.INTEGER}
    },{
        sequelize,
        modelName : "UserScore",
        tableName : "user_score",
        timestamps : false
    });

    return UserScore;
}
