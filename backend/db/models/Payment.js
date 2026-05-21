const { DataTypes } = require('sequelize');
const { getSequelize } = require('../sequelize');

const sequelize = getSequelize();

const Payment = sequelize.define(
  'Payment',
  {
    _id: { type: DataTypes.STRING(36), primaryKey: true },
    userId: { type: DataTypes.STRING(36), allowNull: false, field: 'user' },
    enrollmentId: { type: DataTypes.STRING(36), allowNull: false, field: 'enrollment' },
    amount: { type: DataTypes.INTEGER, allowNull: false },
    method: { type: DataTypes.ENUM('cash', 'card', 'transfer'), allowNull: false, defaultValue: 'card' },
    paidAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW, field: 'paidAt' }
  },
  {
    tableName: 'payments',
    timestamps: true
  }
);

module.exports = Payment;

