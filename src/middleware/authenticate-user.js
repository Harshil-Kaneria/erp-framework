const { verifyAccessToken } = require('../utils/jwt');
const AppError = require('../core/errors/app-error');
const ErrorCodes = require('../core/errors/error-codes');

/**
 * Standard User Authentication Middleware
 * Verifies Bearer JWT token and attaches User context to req.user.
 * Enforces INSTANT logout by checking active refreshToken state in DB.
 */
async function authenticateUser(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('Authentication required. Missing Bearer token.', 401, ErrorCodes.UNAUTHORIZED);
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyAccessToken(token);

    if (decoded.userType && decoded.userType !== 'user') {
      throw new AppError('Access denied: User credentials required', 403, ErrorCodes.FORBIDDEN);
    }

    const { User } = require('../modules/users/user.model');
    const user = await User.scope('withPassword').findByPk(decoded.sub);

    if (!user) {
      throw new AppError('Authenticated user no longer exists', 401, ErrorCodes.UNAUTHORIZED);
    }

    if (!user.isActive) {
      throw new AppError('User account is deactivated', 403, ErrorCodes.USER_INACTIVE);
    }

    // INSTANT LOGOUT CHECK: If refreshToken is null, user has logged out
    if (!user.refreshToken) {
      throw new AppError('User session has expired or logged out', 401, ErrorCodes.TOKEN_EXPIRED);
    }

    req.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
    };

    next();
  } catch (error) {
    next(error);
  }
}

module.exports = authenticateUser;
