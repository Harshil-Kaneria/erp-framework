const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const User = sequelize.define(
  'User',
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
    phone: {
      type: DataTypes.STRING(50),
      allowNull: true,
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
    tableName: 'users',
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

module.exports = { User };
