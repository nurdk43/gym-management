const { DataTypes } = require('sequelize');
const { getSequelize } = require('../sequelize');

const sequelize = getSequelize();

const User = sequelize.define(
  'User',
  {
    _id: {
      type: DataTypes.STRING(36),
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: { notEmpty: true }
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: { isEmail: true }
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: { len: [6, 255] }
    },
    role: {
      type: DataTypes.ENUM('admin', 'trainer', 'member'),
      allowNull: false,
      defaultValue: 'member'
    },
    phone: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      field: 'isActive'
    }
  },
  {
    tableName: 'users',
    timestamps: true
  }
);

module.exports = User;

