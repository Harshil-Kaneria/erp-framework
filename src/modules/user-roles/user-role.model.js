const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const UserRole = sequelize.define(
  'UserRole',
  {
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'users', key: 'id' },
    },
    roleId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'roles', key: 'id' },
    },
  },
  {
    tableName: 'user_roles',
    timestamps: true,
  }
);

module.exports = { UserRole };
