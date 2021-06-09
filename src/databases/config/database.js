require("dotenv").config();

module.exports = {
  local: {
    username: 'grwqkvtkbimzfk',
    password: 'a50ea327c9824a4f386778c8b553648649f597d46e3db29b67ea21849f9a169e',
    database: 'd14fitnnuq2nco',
    host: 'ec2-54-90-13-87.compute-1.amazonaws.com',
    dialect: "postgres",
    define: {
      timestamps: true,
      freezeTableName: true
    },
  },
  development: {
    username: 'grwqkvtkbimzfk',
    password: 'a50ea327c9824a4f386778c8b553648649f597d46e3db29b67ea21849f9a169e',
    database: 'd14fitnnuq2nco',
    host: 'ec2-54-90-13-87.compute-1.amazonaws.com',
    dialect: "postgres",
    dialectOptions: {
      ssl: { require: true, rejectUnauthorized: false },
    },
    define: {
      timestamps: true,
      freezeTableName: true
    },
  },
  test: {
    username: 'grwqkvtkbimzfk',
    password: 'a50ea327c9824a4f386778c8b553648649f597d46e3db29b67ea21849f9a169e',
    database: 'd14fitnnuq2nco',
    host: 'ec2-54-90-13-87.compute-1.amazonaws.com',
    dialect: "postgres",
    dialectOptions: {
      ssl: { require: true, rejectUnauthorized: false },
    },
    define: {
      timestamps: true,
      freezeTableName: true
    },
  },
  production: {
    username: 'grwqkvtkbimzfk',
    password: 'a50ea327c9824a4f386778c8b553648649f597d46e3db29b67ea21849f9a169e',
    database: 'd14fitnnuq2nco',
    host: 'ec2-54-90-13-87.compute-1.amazonaws.com',
    dialect: "postgres",
    dialectOptions: {
      ssl: { require: true, rejectUnauthorized: false },
    },
    define: {
      timestamps: true,
      freezeTableName: true
    },
  },
};
