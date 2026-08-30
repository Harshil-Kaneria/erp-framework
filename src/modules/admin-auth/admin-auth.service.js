const { Admin } = require('../admins/admin.model');
const { Role } = require('../roles/role.model');
const { Permission } = require('../permissions/permission.model');
const { comparePassword, hashPassword } = require('../../utils/password');
const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require('../../utils/jwt');
const AppError = require('../../core/errors/app-error');
const ErrorCodes = require('../../core/errors/error-codes');

class AdminAuthService {
  async login(email, password) {
    const admin = await Admin.scope('withPassword').findOne({
      where: { email },
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
      throw new AppError('Invalid admin email or password', 401, ErrorCodes.INVALID_CREDENTIALS);
    }

    if (!admin.isActive) {
      throw new AppError('Admin account is deactivated', 403, ErrorCodes.USER_INACTIVE);
    }

    const isMatch = await comparePassword(password, admin.password);
    if (!isMatch) {
      throw new AppError('Invalid admin email or password', 401, ErrorCodes.INVALID_CREDENTIALS);
    }

    const accessToken = generateAccessToken({ sub: admin.id, userType: 'admin', type: 'access' });
    const refreshToken = generateRefreshToken({ sub: admin.id, userType: 'admin', type: 'refresh' });

    const hashedRefresh = await hashPassword(refreshToken);
    await admin.update({ refreshToken: hashedRefresh });

    return {
      accessToken,
      refreshToken,
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        roles: admin.roles ? admin.roles.map((r) => r.name) : [],
      },
    };
  }

  async refreshToken(token) {
    const decoded = verifyRefreshToken(token);
    if (decoded.userType !== 'admin') {
      throw new AppError('Invalid admin refresh token', 401, ErrorCodes.TOKEN_INVALID);
    }

    const admin = await Admin.scope('withPassword').findByPk(decoded.sub);
    if (!admin || !admin.refreshToken) {
      throw new AppError('Invalid refresh token', 401, ErrorCodes.TOKEN_INVALID);
    }

    const isMatch = await comparePassword(token, admin.refreshToken);
    if (!isMatch) {
      throw new AppError('Revoked or invalid refresh token', 401, ErrorCodes.TOKEN_INVALID);
    }

    const newAccessToken = generateAccessToken({ sub: admin.id, userType: 'admin', type: 'access' });
    const newRefreshToken = generateRefreshToken({ sub: admin.id, userType: 'admin', type: 'refresh' });

    const hashedRefresh = await hashPassword(newRefreshToken);
    await admin.update({ refreshToken: hashedRefresh });

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }

  async logout(adminId) {
    await Admin.update({ refreshToken: null }, { where: { id: adminId } });
    return true;
  }

  async changePassword(adminId, currentPassword, newPassword) {
    const admin = await Admin.scope('withPassword').findByPk(adminId);
    if (!admin) {
      throw new AppError('Admin not found', 404, ErrorCodes.NOT_FOUND);
    }

    const isMatch = await comparePassword(currentPassword, admin.password);
    if (!isMatch) {
      throw new AppError('Current password is incorrect', 400, ErrorCodes.BAD_REQUEST);
    }

    const hashedNew = await hashPassword(newPassword);
    await admin.update({ password: hashedNew, refreshToken: null });
    return true;
  }
}

module.exports = new AdminAuthService();
