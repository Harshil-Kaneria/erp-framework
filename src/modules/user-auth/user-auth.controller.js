const userAuthService = require('./user-auth.service');

class UserAuthController {
  register = async (req, res, next) => {
    try {
      const result = await userAuthService.register(req.body);
      return res.jsonbash.success(result, 'User registration successful', 201);
    } catch (error) {
      next(error);
    }
  };

  login = async (req, res, next) => {
    try {
      const { email, password } = req.body;
      const result = await userAuthService.login(email, password);
      return res.jsonbash.success(result, 'User login successful');
    } catch (error) {
      next(error);
    }
  };

  refresh = async (req, res, next) => {
    try {
      const { refreshToken } = req.body;
      const result = await userAuthService.refreshToken(refreshToken);
      return res.jsonbash.success(result, 'User tokens refreshed successfully');
    } catch (error) {
      next(error);
    }
  };

  logout = async (req, res, next) => {
    try {
      await userAuthService.logout(req.user.id);
      return res.jsonbash.success(null, 'User logout successful');
    } catch (error) {
      next(error);
    }
  };

  getMe = async (req, res, next) => {
    try {
      return res.jsonbash.success(req.user, 'Current user details retrieved successfully');
    } catch (error) {
      next(error);
    }
  };

  changePassword = async (req, res, next) => {
    try {
      const { currentPassword, newPassword } = req.body;
      await userAuthService.changePassword(req.user.id, currentPassword, newPassword);
      return res.jsonbash.success(null, 'User password changed successfully');
    } catch (error) {
      next(error);
    }
  };
}

module.exports = new UserAuthController();
