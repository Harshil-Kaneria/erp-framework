const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const RolePermission = sequelize.define(
  'RolePermission',
  {
    roleId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'roles', key: 'id' },
    },
    permissionId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'permissions', key: 'id' },
    },
  },
  {
    tableName: 'role_permissions',
    timestamps: true,
  }
);

module.exports = { RolePermission };
