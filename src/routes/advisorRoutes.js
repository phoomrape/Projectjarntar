const express = require('express');
const { body } = require('express-validator');
const AdvisorController = require('../controllers/advisorController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

// GET /api/advisors - ดูรายชื่ออาจารย์ที่ปรึกษาทั้งหมด
router.get('/', authenticateToken, AdvisorController.getAll);

// GET /api/advisors/:id - ดูข้อมูลอาจารย์ตาม ID
router.get('/:id', authenticateToken, AdvisorController.getById);

// POST /api/advisors - เพิ่มอาจารย์ที่ปรึกษา (admin)
router.post(
  '/',
  authenticateToken,
  authorizeRoles('admin'),
  [
    body('advisor_id').notEmpty().withMessage('กรุณาระบุรหัสอาจารย์'),
    body('name').notEmpty().withMessage('กรุณาระบุชื่ออาจารย์'),
    body('faculty').notEmpty().withMessage('กรุณาระบุคณะ'),
    body('department').notEmpty().withMessage('กรุณาระบุสาขา'),
    body('email').isEmail().withMessage('อีเมลไม่ถูกต้อง'),
  ],
  AdvisorController.create
);

// PUT /api/advisors/:id - แก้ไขข้อมูลอาจารย์ (admin, advisor)
router.put(
  '/:id',
  authenticateToken,
  authorizeRoles('admin', 'advisor'),
  AdvisorController.update
);

// DELETE /api/advisors/:id - ลบอาจารย์ (admin)
router.delete(
  '/:id',
  authenticateToken,
  authorizeRoles('admin'),
  AdvisorController.delete
);

module.exports = router;
