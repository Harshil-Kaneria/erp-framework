const BaseController = require('../../core/controllers/base.controller');
const adminService = require('./admin.service');

class AdminController extends BaseController {
  constructor() {
    super(adminService);
  }

  create = async (req, res, next) => {
    try {
      const admin = await this.service.createAdmin(req.body);
      return res.jsonbash.success(admin, 'Admin created successfully', 201);
    } catch (error) {
      next(error);
    }
  };
}

module.exports = new AdminController();
