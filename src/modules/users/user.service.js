const BaseService = require('../../core/services/base.service');
const userRepository = require('./user.repository');
const { hashPassword } = require('../../utils/password');
const AppError = require('../../core/errors/app-error');
const ErrorCodes = require('../../core/errors/error-codes');

class UserService extends BaseService {
  constructor() {
    super(userRepository);
  }

  async createUser(data) {
    const existing = await userRepository.findByEmail(data.email);
    if (existing) {
      throw new AppError('Email is already registered', 409, ErrorCodes.EMAIL_ALREADY_EXISTS);
    }

    const hashedPassword = await hashPassword(data.password);
    return userRepository.create({
      ...data,
      password: hashedPassword,
    });
  }
}

module.exports = new UserService();
