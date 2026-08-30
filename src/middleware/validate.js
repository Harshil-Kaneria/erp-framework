const AppError = require('../core/errors/app-error');
const ErrorCodes = require('../core/errors/error-codes');

/**
 * Validation Middleware using Joi schemas
 * @param {Object} schema - Object containing body, query, or params Joi schemas
 */
function validate(schema = {}) {
  return (req, res, next) => {
    const locations = ['body', 'query', 'params'];
    const errors = [];

    for (const location of locations) {
      if (schema[location]) {
        const { error, value } = schema[location].validate(req[location], {
          abortEarly: false,
          stripUnknown: location === 'body', // strip unknown properties for request body
          allowUnknown: location !== 'body', // allow query/params extras
        });

        if (error) {
          error.details.forEach((detail) => {
            errors.push({
              field: detail.path.join('.'),
              message: detail.message.replace(/['"]/g, ''),
              location,
            });
          });
        } else {
          req[location] = value;
        }
      }
    }

    if (errors.length > 0) {
      return next(new AppError('Invalid input parameters', 422, ErrorCodes.VALIDATION_ERROR, errors));
    }

    next();
  };
}

module.exports = validate;
