const authService = require('./auth.service');

class AuthController {
  login = async (req, res, next) => {
    try {
      const { email, password } = req.body;
      const result = await authService.login(email, password);
      return res.jsonbash.success(result, 'Login successful');
    } catch (error) {
      next(error);
    }
  };

  refresh = async (req, res, next) => {
    try {
      const { refreshToken } = req.body;
      const result = await authService.refreshToken(refreshToken);
      return res.jsonbash.success(result, 'Tokens refreshed successfully');
    } catch (error) {
      next(error);
    }
  };

  logout = async (req, res, next) => {
    try {
      await authService.logout(req.user.id);
      return res.jsonbash.success(null, 'Logout successful');
    } catch (error) {
      next(error);
    }
  };

  getMe = async (req, res, next) => {
    try {
      return res.jsonbash.success(req.user, 'Current user retrieved successfully');
    } catch (error) {
      next(error);
    }
  };

  changePassword = async (req, res, next) => {
    try {
      const { currentPassword, newPassword } = req.body;
      await authService.changePassword(req.user.id, currentPassword, newPassword);
      return res.jsonbash.success(null, 'Password changed successfully');
    } catch (error) {
      next(error);
    }
  };

  forgotPassword = async (req, res, next) => {
    try {
      await authService.forgotPassword(req.body.email);
      return res.jsonbash.success(null, 'Password reset instructions sent if email exists');
    } catch (error) {
      next(error);
    }
  };

  resetPassword = async (req, res, next) => {
    try {
      await authService.resetPassword(req.body.token, req.body.newPassword);
      return res.jsonbash.success(null, 'Password reset successful');
    } catch (error) {
      next(error);
    }
  };
}

module.exports = new AuthController();
