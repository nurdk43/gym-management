const { DataTypes } = require('sequelize');
const { getSequelize } = require('../sequelize');

const sequelize = getSequelize();

const Program = sequelize.define(
  'Program',
  {
    _id: { type: DataTypes.STRING(36), primaryKey: true },
    title: { type: DataTypes.STRING(255), allowNull: false, validate: { notEmpty: true } },
    description: { type: DataTypes.TEXT, allowNull: true },
    // FK alan adını trainerId yapıyoruz; böylece `trainer` association alias'ı collision yapmaz.
    trainerId: { type: DataTypes.STRING(36), allowNull: false, field: 'trainer' },
    dayOfWeek: {
      type: DataTypes.ENUM('Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'),
      allowNull: true
    },
    time: { type: DataTypes.STRING(20), allowNull: true },
    maxCapacity: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 20, field: 'maxCapacity' },
    isActive: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true, field: 'isActive' }
  },
  {
    tableName: 'programs',
    timestamps: true
  }
);

module.exports = Program;

