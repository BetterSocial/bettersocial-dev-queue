"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
    class LogError extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
        }
    }
    LogError.init(
        {
            id: {
                type: DataTypes.BIGINT,
                primaryKey: true,
                autoIncrement: true,
            },
            message: DataTypes.TEXT,
            createdAt: {
                type: DataTypes.DATE,
                field: "created_at",
                allowNull: false,
            },
            updatedAt: {
                type: DataTypes.DATE,
                field: "updated_at",
                allowNull: false,
            },
        },
        {
            sequelize,
            modelName: "LogError",
            tableName: "log_errors",
            underscored: true,
        }
    );
    return LogError;
};
