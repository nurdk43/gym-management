const { DataTypes } = require('sequelize');
const { getSequelize } = require('../sequelize');

const sequelize = getSequelize();

const ProgramMember = sequelize.define(
  'ProgramMember',
  {
    _id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    program: { type: DataTypes.STRING(36), allowNull: false },
    member: { type: DataTypes.STRING(36), allowNull: false }
  },
  {
    tableName: 'program_members',
    timestamps: false,
    indexes: [
      {
        unique: true,
        fields: ['program', 'member']
      }
    ]
  }
);

module.exports = ProgramMember;

