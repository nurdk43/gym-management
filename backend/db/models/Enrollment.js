const { DataTypes } = require('sequelize');
const { getSequelize } = require('../sequelize');

const sequelize = getSequelize();

const Enrollment = sequelize.define(
  'Enrollment',
  {
    _id: { type: DataTypes.STRING(36), primaryKey: true },
    // FK alan adlarını userId/packageId yapıyoruz.
    userId: { type: DataTypes.STRING(36), allowNull: false, field: 'user' },
    packageId: { type: DataTypes.STRING(36), allowNull: false, field: 'package' },
    startDate: { type: DataTypes.DATE, allowNull: false, field: 'startDate' },
    endDate: { type: DataTypes.DATE, allowNull: false, field: 'endDate' },
    status: { type: DataTypes.ENUM('active', 'expired', 'cancelled'), allowNull: false, defaultValue: 'active' }
  },
  {
    tableName: 'enrollments',
    timestamps: true
  }
);

module.exports = Enrollment;

