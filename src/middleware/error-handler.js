const config = require('../config/env');
const logger = require('../utils/logger');
const ErrorCodes = require('../core/errors/error-codes');

/**
 * Centralized Application Error Handling Middleware using JsonBash
 */
function errorHandler(err, req, res, next) {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'An unexpected error occurred';
  let errorCode = err.errorCode || ErrorCodes.INTERNAL_SERVER_ERROR;
  let errors = err.details || undefined;

  // Log error
  logger.error(`${req.method} ${req.originalUrl} - ${statusCode} - ${message}`, {
    errorCode,
    stack: config.env !== 'production' ? err.stack : undefined,
  });

  // Handle Sequelize Database Errors safely
  if (err.name && err.name.startsWith('Sequelize')) {
    statusCode = 400;
    errorCode = ErrorCodes.BAD_REQUEST;

    if (err.name === 'SequelizeUniqueConstraintError') {
      message = 'Duplicate field value entered';
      errors = err.errors ? err.errors.map((e) => ({ field: e.path, message: e.message })) : undefined;
    } else if (err.name === 'SequelizeValidationError') {
      message = 'Database validation failure';
      errors = err.errors ? err.errors.map((e) => ({ field: e.path, message: e.message })) : undefined;
    } else if (config.env === 'production') {
      message = 'Database operation failed';
    }
  }

  // Always use JsonBash response error helper
  return res.jsonbash.error(message, statusCode, errorCode, errors);
}

module.exports = errorHandler;
