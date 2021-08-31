"use strict";
const {Model} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class PostScore extends Model {
        static associate(models) {}
    }

    PostScore.init({
        post_score_id : {
            type : DataTypes.UUID,
            allowNull : false,
            primaryKey : true
        },
        feed_id : { type : DataTypes.UUID, allowNull : false},
        post_score : { type : DataTypes.INTEGER}
    }, {
        sequelize,
        modelName : "PostScore",
        tableName : "post_score",
        timestamps : false
    });

    return PostScore;
}
