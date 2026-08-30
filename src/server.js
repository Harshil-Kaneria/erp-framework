const app = require('./app');
const config = require('./config/env');
const { sequelize } = require('./config/database');
const logger = require('./utils/logger');

async function startServer() {
  try {
    // Authenticate Database Connection
    await sequelize.authenticate();
    logger.info('Database connection established successfully via Sequelize.');

    const server = app.listen(config.port, () => {
      logger.info(`ERP Backend API running in [${config.env}] mode on port ${config.port}`);
    });

    // Graceful Shutdown handling
    const handleShutdown = async (signal) => {
      logger.info(`Received ${signal}. Closing HTTP server and database pool...`);
      server.close(async () => {
        await sequelize.close();
        logger.info('Database connection closed. Exiting process.');
        process.exit(0);
      });
    };

    process.on('SIGINT', () => handleShutdown('SIGINT'));
    process.on('SIGTERM', () => handleShutdown('SIGTERM'));
  } catch (error) {
    logger.error(`Unable to connect to the database: ${error.message}`, { stack: error.stack });
    process.exit(1);
  }
}

startServer();
