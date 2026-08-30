const { User } = require('../users/user.model');
const { comparePassword, hashPassword } = require('../../utils/password');
const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require('../../utils/jwt');
const AppError = require('../../core/errors/app-error');
const ErrorCodes = require('../../core/errors/error-codes');

class UserAuthService {
  async register(userData) {
    const existing = await User.findOne({ where: { email: userData.email } });
    if (existing) {
      throw new AppError('Email is already registered', 409, ErrorCodes.EMAIL_ALREADY_EXISTS);
    }

    const hashedPassword = await hashPassword(userData.password);
    const user = await User.create({
      ...userData,
      password: hashedPassword,
    });

    const accessToken = generateAccessToken({ sub: user.id, userType: 'user', type: 'access' });
    const refreshToken = generateRefreshToken({ sub: user.id, userType: 'user', type: 'refresh' });

    const hashedRefresh = await hashPassword(refreshToken);
    await user.update({ refreshToken: hashedRefresh });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
      },
    };
  }

  async login(email, password) {
    const user = await User.scope('withPassword').findOne({ where: { email } });

    if (!user) {
      throw new AppError('Invalid email or password', 401, ErrorCodes.INVALID_CREDENTIALS);
    }

    if (!user.isActive) {
      throw new AppError('User account is deactivated', 403, ErrorCodes.USER_INACTIVE);
    }

    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      throw new AppError('Invalid email or password', 401, ErrorCodes.INVALID_CREDENTIALS);
    }

    const accessToken = generateAccessToken({ sub: user.id, userType: 'user', type: 'access' });
    const refreshToken = generateRefreshToken({ sub: user.id, userType: 'user', type: 'refresh' });

    const hashedRefresh = await hashPassword(refreshToken);
    await user.update({ refreshToken: hashedRefresh });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
      },
    };
  }

  async refreshToken(token) {
    const decoded = verifyRefreshToken(token);
    if (decoded.userType !== 'user') {
      throw new AppError('Invalid user refresh token', 401, ErrorCodes.TOKEN_INVALID);
    }

    const user = await User.scope('withPassword').findByPk(decoded.sub);
    if (!user || !user.refreshToken) {
      throw new AppError('Invalid refresh token', 401, ErrorCodes.TOKEN_INVALID);
    }

    const isMatch = await comparePassword(token, user.refreshToken);
    if (!isMatch) {
      throw new AppError('Revoked or invalid refresh token', 401, ErrorCodes.TOKEN_INVALID);
    }

    const newAccessToken = generateAccessToken({ sub: user.id, userType: 'user', type: 'access' });
    const newRefreshToken = generateRefreshToken({ sub: user.id, userType: 'user', type: 'refresh' });

    const hashedRefresh = await hashPassword(newRefreshToken);
    await user.update({ refreshToken: hashedRefresh });

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }

  async logout(userId) {
    await User.update({ refreshToken: null }, { where: { id: userId } });
    return true;
  }

  async changePassword(userId, currentPassword, newPassword) {
    const user = await User.scope('withPassword').findByPk(userId);
    if (!user) {
      throw new AppError('User not found', 404, ErrorCodes.NOT_FOUND);
    }

    const isMatch = await comparePassword(currentPassword, user.password);
    if (!isMatch) {
      throw new AppError('Current password is incorrect', 400, ErrorCodes.BAD_REQUEST);
    }

    const hashedNew = await hashPassword(newPassword);
    await user.update({ password: hashedNew, refreshToken: null });
    return true;
  }
}

module.exports = new UserAuthService();
