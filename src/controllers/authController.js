const AuthService = require('../services/authService');
const { validationResult } = require('express-validator');

class AuthController {
  // POST /api/auth/register
  static async register(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const { username, password, role } = req.body;
      const user = await AuthService.register({ username, password, role });

      res.status(201).json({
        success: true,
        message: 'สร้างบัญชีสำเร็จ',
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  // POST /api/auth/login
  static async login(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const { username, password } = req.body;
      const result = await AuthService.login({ username, password });

      res.json({
        success: true,
        message: 'เข้าสู่ระบบสำเร็จ',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/auth/profile
  static async getProfile(req, res, next) {
    try {
      const user = await AuthService.getProfile(req.user.id);
      res.json({ success: true, data: user });
    } catch (error) {
      next(error);
    }
  }

  // PUT /api/auth/change-password
  static async changePassword(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const { currentPassword, newPassword } = req.body;
      await AuthService.changePassword(req.user.id, { currentPassword, newPassword });

      res.json({ success: true, message: 'เปลี่ยนรหัสผ่านสำเร็จ' });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = AuthController;
