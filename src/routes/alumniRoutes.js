const express = require('express');
const { body } = require('express-validator');
const AlumniController = require('../controllers/alumniController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

// GET /api/alumni - ดูรายชื่อศิษย์เก่าทั้งหมด
router.get('/', authenticateToken, AlumniController.getAll);

// GET /api/alumni/:id - ดูข้อมูลศิษย์เก่าตาม ID
router.get('/:id', authenticateToken, AlumniController.getById);

// POST /api/alumni - เพิ่มศิษย์เก่า (admin)
router.post(
  '/',
  authenticateToken,
  authorizeRoles('admin'),
  [
    body('alumni_id').notEmpty().withMessage('กรุณาระบุรหัสศิษย์เก่า'),
    body('first_name').notEmpty().withMessage('กรุณาระบุชื่อ'),
    body('last_name').notEmpty().withMessage('กรุณาระบุนามสกุล'),
    body('faculty').notEmpty().withMessage('กรุณาระบุคณะ'),
    body('department').notEmpty().withMessage('กรุณาระบุสาขา'),
    body('graduation_year').isInt().withMessage('กรุณาระบุปีที่จบ'),
  ],
  AlumniController.create
);

// PUT /api/alumni/:id - แก้ไขข้อมูลศิษย์เก่า (admin, เจ้าของข้อมูล)
router.put(
  '/:id',
  authenticateToken,
  authorizeRoles('admin', 'student'),
  AlumniController.update
);

// DELETE /api/alumni/:id - ลบศิษย์เก่า (admin)
router.delete(
  '/:id',
  authenticateToken,
  authorizeRoles('admin'),
  AlumniController.delete
);

module.exports = router;
