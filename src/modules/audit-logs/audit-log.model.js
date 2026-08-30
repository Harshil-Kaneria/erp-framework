const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const AuditLog = sequelize.define(
  'AuditLog',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    action: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    resource: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    resourceId: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    details: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    ip: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    timestamp: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: 'audit_logs',
    timestamps: true,
  }
);

module.exports = { AuditLog };
