const { Sequelize } = require('sequelize');
const config = require('./env');

const dbConfig = {
  username: config.db.user,
  password: config.db.pass,
  database: config.db.name,
  host: config.db.host,
  port: config.db.port,
  dialect: config.db.dialect,
  logging: config.db.logging,
  pool: {
    max: 20,
    min: 2,
    acquire: 30000,
    idle: 10000,
  },
  define: {
    timestamps: true,
    underscored: false,
  },
};

const sequelize = new Sequelize(
  config.db.name,
  config.db.user,
  config.db.pass,
  {
    host: config.db.host,
    port: config.db.port,
    dialect: config.db.dialect,
    logging: config.db.logging,
    pool: dbConfig.pool,
    define: dbConfig.define,
  }
);

module.exports = {
  development: dbConfig,
  test: { ...dbConfig, database: `${config.db.name}_test` },
  production: dbConfig,
  sequelize,
};
