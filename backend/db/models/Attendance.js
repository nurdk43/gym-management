const { DataTypes } = require('sequelize');
const { getSequelize } = require('../sequelize');

const sequelize = getSequelize();

const Attendance = sequelize.define(
  'Attendance',
  {
    _id: { type: DataTypes.STRING(36), primaryKey: true },
    userId: { type: DataTypes.STRING(36), allowNull: false, field: 'user' },
    trainerId: { type: DataTypes.STRING(36), allowNull: true, field: 'trainer' },
    date: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW, field: 'date' },
    checkIn: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW, field: 'checkIn' },
    checkOut: { type: DataTypes.DATE, allowNull: true, field: 'checkOut' }
  },
  {
    tableName: 'attendances',
    timestamps: true
  }
);

module.exports = Attendance;

