'use strict';
const {
  Model
} = require('sequelize');

const bcrypt = require('bcrypt')
const {serverConfig} = require('../config')

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsToMany(models.Role, {through : 'User_Roles', as:'role'})
    }
  }
  User.init({
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [3, 50]
      }
    }
  }, {
    sequelize,
    modelName: 'User',
  });

  User.beforeCreate(function encrypt(User){
    const encryptedPassword = bcrypt.hashSync(User.password, +serverConfig.SALT_ROUNDS)
    User.password = encryptedPassword
  })
  return User;
};