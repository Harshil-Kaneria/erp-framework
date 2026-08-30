const { verifyAccessToken } = require('../utils/jwt');
const AppError = require('../core/errors/app-error');
const ErrorCodes = require('../core/errors/error-codes');

/**
 * Authentication Middleware
 * Verifies Bearer JWT token and attaches user context to req.user
 */
async function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('Authentication required. Missing Bearer token.', 401, ErrorCodes.UNAUTHORIZED);
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyAccessToken(token);

    // Fetch user details including roles and permissions
    const { User } = require('../modules/users/user.model');
    const { Role } = require('../modules/roles/role.model');
    const { Permission } = require('../modules/permissions/permission.model');

    const user = await User.findByPk(decoded.sub, {
      include: [
        {
          model: Role,
          as: 'roles',
          through: { attributes: [] },
          include: [
            {
              model: Permission,
              as: 'permissions',
              through: { attributes: [] },
            },
          ],
        },
      ],
      attributes: { exclude: ['password'] },
    });

    if (!user) {
      throw new AppError('Authenticated user no longer exists', 401, ErrorCodes.UNAUTHORIZED);
    }

    if (!user.isActive) {
      throw new AppError('User account is deactivated', 403, ErrorCodes.USER_INACTIVE);
    }

    // Flatten user permissions set
    const userPermissions = new Set();
    if (user.roles) {
      user.roles.forEach((role) => {
        if (role.permissions) {
          role.permissions.forEach((perm) => userPermissions.add(perm.name));
        }
      });
    }

    req.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      roles: user.roles ? user.roles.map((r) => r.name) : [],
      permissions: Array.from(userPermissions),
    };

    next();
  } catch (error) {
    next(error);
  }
}

module.exports = authenticate;
