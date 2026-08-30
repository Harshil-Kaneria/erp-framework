const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const AdminRole = sequelize.define(
  'AdminRole',
  {
    adminId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'admins', key: 'id' },
    },
    roleId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'roles', key: 'id' },
    },
  },
  {
    tableName: 'admin_roles',
    timestamps: true,
  }
);

module.exports = { AdminRole };
