const adminAuthService = require('./admin-auth.service');

class AdminAuthController {
  login = async (req, res, next) => {
    try {
      const { email, password } = req.body;
      const result = await adminAuthService.login(email, password);
      return res.jsonbash.success(result, 'Admin login successful');
    } catch (error) {
      next(error);
    }
  };

  refresh = async (req, res, next) => {
    try {
      const { refreshToken } = req.body;
      const result = await adminAuthService.refreshToken(refreshToken);
      return res.jsonbash.success(result, 'Admin tokens refreshed successfully');
    } catch (error) {
      next(error);
    }
  };

  logout = async (req, res, next) => {
    try {
      await adminAuthService.logout(req.admin.id);
      return res.jsonbash.success(null, 'Admin logout successful');
    } catch (error) {
      next(error);
    }
  };

  getMe = async (req, res, next) => {
    try {
      return res.jsonbash.success(req.admin, 'Current admin details retrieved successfully');
    } catch (error) {
      next(error);
    }
  };

  changePassword = async (req, res, next) => {
    try {
      const { currentPassword, newPassword } = req.body;
      await adminAuthService.changePassword(req.admin.id, currentPassword, newPassword);
      return res.jsonbash.success(null, 'Admin password changed successfully');
    } catch (error) {
      next(error);
    }
  };
}

module.exports = new AdminAuthController();
