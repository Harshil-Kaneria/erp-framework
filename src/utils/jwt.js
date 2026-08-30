const jwt = require('jsonwebtoken');
const config = require('../config/env');
const AppError = require('../core/errors/app-error');
const ErrorCodes = require('../core/errors/error-codes');

/**
 * Sign an Access Token
 */
function generateAccessToken(payload) {
  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
  });
}

/**
 * Sign a Refresh Token
 */
function generateRefreshToken(payload) {
  return jwt.sign(payload, config.jwt.refreshSecret, {
    expiresIn: config.jwt.refreshExpiresIn,
  });
}

/**
 * Verify Access Token
 */
function verifyAccessToken(token) {
  try {
    return jwt.verify(token, config.jwt.secret);
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new AppError('Access token has expired', 401, ErrorCodes.TOKEN_EXPIRED);
    }
    throw new AppError('Invalid access token', 401, ErrorCodes.TOKEN_INVALID);
  }
}

/**
 * Verify Refresh Token
 */
function verifyRefreshToken(token) {
  try {
    return jwt.verify(token, config.jwt.refreshSecret);
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new AppError('Refresh token has expired', 401, ErrorCodes.TOKEN_EXPIRED);
    }
    throw new AppError('Invalid refresh token', 401, ErrorCodes.TOKEN_INVALID);
  }
}

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
};
