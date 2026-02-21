const express = require('express');
const { body } = require('express-validator');
const StudentController = require('../controllers/studentController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

// GET /api/students - ดูรายชื่อนักศึกษาทั้งหมด
router.get('/', authenticateToken, StudentController.getAll);

// GET /api/students/:id - ดูข้อมูลนักศึกษาตาม ID
router.get('/:id', authenticateToken, StudentController.getById);

// POST /api/students - เพิ่มนักศึกษา (admin เท่านั้น)
router.post(
  '/',
  authenticateToken,
  authorizeRoles('admin'),
  [
    body('student_id').notEmpty().withMessage('กรุณาระบุรหัสนักศึกษา'),
    body('first_name').notEmpty().withMessage('กรุณาระบุชื่อ'),
    body('last_name').notEmpty().withMessage('กรุณาระบุนามสกุล'),
    body('faculty').notEmpty().withMessage('กรุณาระบุคณะ'),
    body('department').notEmpty().withMessage('กรุณาระบุสาขา'),
    body('year').isInt({ min: 1, max: 8 }).withMessage('กรุณาระบุชั้นปี (1-8)'),
    body('email').isEmail().withMessage('อีเมลไม่ถูกต้อง'),
  ],
  StudentController.create
);

// PUT /api/students/:id - แก้ไขข้อมูลนักศึกษา (admin, advisor)
router.put(
  '/:id',
  authenticateToken,
  authorizeRoles('admin', 'advisor'),
  StudentController.update
);

// PUT /api/students/status/batch - เปลี่ยนสถานะหลายคน (admin)
router.put(
  '/status/batch',
  authenticateToken,
  authorizeRoles('admin'),
  [
    body('ids').isArray({ min: 1 }).withMessage('กรุณาระบุรายชื่อนักศึกษา'),
    body('status').isIn(['Active', 'Graduated', 'Suspended']).withMessage('สถานะไม่ถูกต้อง'),
  ],
  StudentController.updateStatus
);

// POST /api/students/graduate - ย้ายนักศึกษาเป็นศิษย์เก่า (admin)
router.post(
  '/graduate',
  authenticateToken,
  authorizeRoles('admin'),
  [
    body('studentIds').isArray({ min: 1 }).withMessage('กรุณาระบุรายชื่อนักศึกษา'),
  ],
  StudentController.graduateStudents
);

// DELETE /api/students/:id - ลบนักศึกษา (admin เท่านั้น)
router.delete(
  '/:id',
  authenticateToken,
  authorizeRoles('admin'),
  StudentController.delete
);

module.exports = router;
