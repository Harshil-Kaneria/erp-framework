const AppError = require('../core/errors/app-error');
const ErrorCodes = require('../core/errors/error-codes');

/**
 * 404 Handler for non-existent API routes
 */
function notFoundHandler(req, res, next) {
  next(new AppError(`Route not found: ${req.method} ${req.originalUrl}`, 404, ErrorCodes.NOT_FOUND));
}

module.exports = notFoundHandler;
