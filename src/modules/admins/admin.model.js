const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');
const { Role } = require('../roles/role.model');
const { AdminRole } = require('../admin-roles/admin-role.model');

const Admin = sequelize.define(
  'Admin',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(150),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      allowNull: false,
    },
    refreshToken: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
  },
  {
    tableName: 'admins',
    timestamps: true,
    defaultScope: {
      attributes: { exclude: ['password', 'refreshToken'] },
    },
    scopes: {
      withPassword: {
        attributes: { include: ['password', 'refreshToken'] },
      },
    },
  }
);

Admin.belongsToMany(Role, {
  through: AdminRole,
  foreignKey: 'adminId',
  otherKey: 'roleId',
  as: 'roles',
});

Role.belongsToMany(Admin, {
  through: AdminRole,
  foreignKey: 'roleId',
  otherKey: 'adminId',
  as: 'admins',
});

module.exports = { Admin };
