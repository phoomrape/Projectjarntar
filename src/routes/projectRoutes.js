const express = require('express');
const { body } = require('express-validator');
const ProjectController = require('../controllers/projectController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

// GET /api/projects - ดูรายชื่อโครงงานทั้งหมด
router.get('/', authenticateToken, ProjectController.getAll);

// GET /api/projects/:id - ดูข้อมูลโครงงานตาม ID
router.get('/:id', authenticateToken, ProjectController.getById);

// POST /api/projects - เพิ่มโครงงาน (admin, advisor, student)
router.post(
  '/',
  authenticateToken,
  [
    body('project_id').notEmpty().withMessage('กรุณาระบุรหัสโครงงาน'),
    body('title_th').notEmpty().withMessage('กรุณาระบุชื่อโครงงาน (ภาษาไทย)'),
    body('year').isInt().withMessage('กรุณาระบุปี'),
  ],
  ProjectController.create
);

// PUT /api/projects/:id - แก้ไขโครงงาน (admin, advisor)
router.put(
  '/:id',
  authenticateToken,
  authorizeRoles('admin', 'advisor'),
  ProjectController.update
);

// POST /api/projects/:id/comments - เพิ่มความคิดเห็น
router.post(
  '/:id/comments',
  authenticateToken,
  [
    body('author_name').notEmpty().withMessage('กรุณาระบุชื่อผู้แสดงความคิดเห็น'),
    body('author_role').notEmpty().withMessage('กรุณาระบุบทบาท'),
    body('message').notEmpty().withMessage('กรุณาระบุข้อความ'),
  ],
  ProjectController.addComment
);

// DELETE /api/projects/:id - ลบโครงงาน (admin)
router.delete(
  '/:id',
  authenticateToken,
  authorizeRoles('admin'),
  ProjectController.delete
);

module.exports = router;
