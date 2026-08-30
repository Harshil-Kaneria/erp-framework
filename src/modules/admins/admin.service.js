const BaseService = require('../../core/services/base.service');
const adminRepository = require('./admin.repository');
const { hashPassword } = require('../../utils/password');
const AppError = require('../../core/errors/app-error');
const ErrorCodes = require('../../core/errors/error-codes');

class AdminService extends BaseService {
  constructor() {
    super(adminRepository);
  }

  async createAdmin(data) {
    const existing = await adminRepository.findByEmail(data.email);
    if (existing) {
      throw new AppError('Admin email is already registered', 409, ErrorCodes.EMAIL_ALREADY_EXISTS);
    }

    const hashedPassword = await hashPassword(data.password);
    return adminRepository.create({
      ...data,
      password: hashedPassword,
    });
  }
}

module.exports = new AdminService();
