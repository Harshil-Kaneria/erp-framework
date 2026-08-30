const { verifyAccessToken } = require('../utils/jwt');
const AppError = require('../core/errors/app-error');
const ErrorCodes = require('../core/errors/error-codes');

/**
 * Admin Authentication Middleware
 * Verifies Bearer JWT token and attaches Admin context (with roles & permissions) to req.admin.
 * Enforces INSTANT logout by checking active refreshToken state in DB.
 */
async function authenticateAdmin(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('Admin authentication required. Missing Bearer token.', 401, ErrorCodes.UNAUTHORIZED);
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyAccessToken(token);

    if (decoded.userType && decoded.userType !== 'admin') {
      throw new AppError('Access denied: Admin credentials required', 403, ErrorCodes.FORBIDDEN);
    }

    const { Admin } = require('../modules/admins/admin.model');
    const { Role } = require('../modules/roles/role.model');
    const { Permission } = require('../modules/permissions/permission.model');

    const admin = await Admin.scope('withPassword').findByPk(decoded.sub, {
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
    });

    if (!admin) {
      throw new AppError('Authenticated Admin no longer exists', 401, ErrorCodes.UNAUTHORIZED);
    }

    if (!admin.isActive) {
      throw new AppError('Admin account is deactivated', 403, ErrorCodes.USER_INACTIVE);
    }

    // INSTANT LOGOUT CHECK: If refreshToken is null, admin has logged out
    if (!admin.refreshToken) {
      throw new AppError('Admin session has expired or logged out', 401, ErrorCodes.TOKEN_EXPIRED);
    }

    // Flatten Admin permissions set
    const adminPermissions = new Set();
    if (admin.roles) {
      admin.roles.forEach((role) => {
        if (role.permissions) {
          role.permissions.forEach((perm) => adminPermissions.add(perm.name));
        }
      });
    }

    req.admin = {
      id: admin.id,
      name: admin.name,
      email: admin.email,
      roles: admin.roles ? admin.roles.map((r) => r.name) : [],
      permissions: Array.from(adminPermissions),
    };

    next();
  } catch (error) {
    next(error);
  }
}

module.exports = authenticateAdmin;
