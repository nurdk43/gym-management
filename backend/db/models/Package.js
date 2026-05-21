const { DataTypes } = require('sequelize');
const { getSequelize } = require('../sequelize');

const sequelize = getSequelize();

const Package = sequelize.define(
  'Package',
  {
    _id: { type: DataTypes.STRING(36), primaryKey: true },
    name: { type: DataTypes.STRING(255), allowNull: false, validate: { notEmpty: true } },
    description: { type: DataTypes.TEXT, allowNull: true },
    price: { type: DataTypes.INTEGER, allowNull: false },
    durationDays: { type: DataTypes.INTEGER, allowNull: false },
    maxClasses: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    isActive: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true, field: 'isActive' }
  },
  {
    tableName: 'packages',
    timestamps: true
  }
);

module.exports = Package;

