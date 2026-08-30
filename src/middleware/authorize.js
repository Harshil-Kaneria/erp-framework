const AppError = require('../core/errors/app-error');
const ErrorCodes = require('../core/errors/error-codes');

/**
 * Helper to evaluate permission access based on ANY or ALL mode.
 * Rule: If permission array is empty ([]), ALL authenticated admins are granted access.
 */
function checkPermissions(adminPermissions = [], requiredPermissions = [], mode = 'any') {
  // RULE: If required permissions array is empty ([]), allow access to any authenticated admin
  if (!requiredPermissions || !Array.isArray(requiredPermissions) || requiredPermissions.length === 0) {
    return true;
  }

  // Super admin override: if admin has 'super_admin' role or '*' permission
  if (adminPermissions.includes('*') || adminPermissions.includes('all')) {
    return true;
  }

  if (mode === 'all') {
    return requiredPermissions.every((perm) => adminPermissions.includes(perm));
  }

  // Mode 'any' (default)
  return requiredPermissions.some((perm) => adminPermissions.includes(perm));
}

/**
 * Base authorize middleware generator for Admin RBAC (default ANY semantics)
 */
function authorize(permissions = []) {
  return (req, res, next) => {
    if (!req.admin) {
      return next(new AppError('Admin authentication required', 401, ErrorCodes.UNAUTHORIZED));
    }

    const hasAccess = checkPermissions(req.admin.permissions || [], permissions, 'any');
    if (!hasAccess) {
      return next(new AppError('Forbidden: Insufficient permissions', 403, ErrorCodes.FORBIDDEN));
    }

    next();
  };
}

/**
 * Authorize ANY of the specified permissions (or empty array = allow all authenticated admins)
 */
authorize.any = (permissions = []) => {
  return (req, res, next) => {
    if (!req.admin) {
      return next(new AppError('Admin authentication required', 401, ErrorCodes.UNAUTHORIZED));
    }

    const hasAccess = checkPermissions(req.admin.permissions || [], permissions, 'any');
    if (!hasAccess) {
      return next(new AppError('Forbidden: Insufficient permissions', 403, ErrorCodes.FORBIDDEN));
    }

    next();
  };
};

/**
 * Authorize ALL of the specified permissions (or empty array = allow all authenticated admins)
 */
authorize.all = (permissions = []) => {
  return (req, res, next) => {
    if (!req.admin) {
      return next(new AppError('Admin authentication required', 401, ErrorCodes.UNAUTHORIZED));
    }

    const hasAccess = checkPermissions(req.admin.permissions || [], permissions, 'all');
    if (!hasAccess) {
      return next(new AppError('Forbidden: Insufficient permissions', 403, ErrorCodes.FORBIDDEN));
    }

    next();
  };
};

module.exports = authorize;
