const {Model} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      // models.User.hasMany(models.UserFollowUser);

      // models.User.hasMany(models.UserFollowUser, {
      //   foreignKey: "user_id_follower",
      //   as: "following",
      // });

      // models.User.hasMany(models.UserFollowUser, {
      //   foreignKey: "user_id_followed",
      //   as: "follower",
      // });

      models.User.belongsToMany(models.Topics, {
        through: 'user_topics',
        foreignKey: 'user_id',
        as: 'topics'
      });

      // models.User.belongsToMany(models.Locations, {
      //   through: "user_location",
      //   foreignKey: "user_id",
      //   as: "locations",
      // });
      // models.User.belongsToMany(models.UserLocation, {
      //   through: "user_location",
      //   foreignKey: "user_id",
      //   as: "user_locations",
      // });
    }
  }
  User.init(
    {
      user_id: {type: DataTypes.UUID, allowNull: false, primaryKey: true},
      human_id: {type: DataTypes.STRING, allowNull: false, unique: true},
      country_code: {type: DataTypes.STRING, allowNull: false},
      username: {type: DataTypes.STRING, allowNull: false, unique: true},
      real_name: {type: DataTypes.STRING, allowNull: true},
      encrypted: {
        type: DataTypes.STRING,
        allowNull: true
      },
      createdAt: {
        type: DataTypes.DATE,
        field: 'created_at',
        allowNull: false
      },
      updatedAt: {
        type: DataTypes.DATE,
        field: 'updated_at',
        allowNull: false
      },
      last_active_at: {type: DataTypes.DATE, allowNull: false},
      profile_pic_path: {type: DataTypes.STRING, allowNull: true},
      profile_pic_asset_id: {type: DataTypes.STRING, allowNull: true},
      profile_pic_public_id: {type: DataTypes.STRING, allowNull: true},
      status: {type: DataTypes.BOOLEAN, allowNull: false},
      bio: {type: DataTypes.TEXT, allowNull: true},
      blocked_by_admin: {type: DataTypes.BOOLEAN, defaultValue: 0, allowNull: true},
      w_pu_user: {type: DataTypes.DOUBLE, defaultValue: 1, allowNull: true},
      is_anonymous: {type: DataTypes.BOOLEAN, allowNull: false},
      combined_user_score: {type: DataTypes.DOUBLE, defaultValue: 0, allowNull: false},
      karma_score: {type: DataTypes.DOUBLE, defaultValue: 0, allowNull: false},
      followers_count: {type: DataTypes.INTEGER, defaultValue: 0, allowNull: false}
    },
    {
      sequelize,
      modelName: 'User',
      tableName: 'users',
      underscored: true
    }
  );
  return User;
};
