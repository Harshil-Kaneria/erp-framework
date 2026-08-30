const BaseController = require('../../core/controllers/base.controller');
const userService = require('./user.service');

class UserController extends BaseController {
  constructor() {
    super(userService);
  }

  create = async (req, res, next) => {
    try {
      const user = await this.service.createUser(req.body);
      return res.jsonbash.success(user, 'User created successfully', 201);
    } catch (error) {
      next(error);
    }
  };
}

module.exports = new UserController();
