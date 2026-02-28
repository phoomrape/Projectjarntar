const express = require('express');
const { body } = require('express-validator');
const AuthController = require('../controllers/authController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

// POST /api/auth/register - สมัครสมาชิก (เฉพาะ admin เท่านั้น)
router.post(
  '/register',
  authenticateToken,
  authorizeRoles('admin'),
  [
    body('username').notEmpty().withMessage('กรุณาระบุ username'),
    body('password').isLength({ min: 6 }).withMessage('รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร'),
    body('role').isIn(['student', 'advisor', 'admin']).withMessage('บทบาทไม่ถูกต้อง'),
  ],
  AuthController.register
);

// POST /api/auth/login - เข้าสู่ระบบ
router.post(
  '/login',
  [
    body('username').notEmpty().withMessage('กรุณาระบุ username'),
    body('password').notEmpty().withMessage('กรุณาระบุรหัสผ่าน'),
  ],
  AuthController.login
);

// GET /api/auth/profile - ข้อมูลผู้ใช้ปัจจุบัน
router.get('/profile', authenticateToken, AuthController.getProfile);

// PUT /api/auth/profile - แก้ไขโปรไฟล์ (นักศึกษา: อีเมล, เบอร์โทร, ที่อยู่)
router.put('/profile', authenticateToken, AuthController.updateProfile);

// PUT /api/auth/change-password - เปลี่ยนรหัสผ่าน
router.put(
  '/change-password',
  authenticateToken,
  [
    body('currentPassword').notEmpty().withMessage('กรุณาระบุรหัสผ่านปัจจุบัน'),
    body('newPassword').isLength({ min: 6 }).withMessage('รหัสผ่านใหม่ต้องมีอย่างน้อย 6 ตัวอักษร'),
  ],
  AuthController.changePassword
);

module.exports = router;
