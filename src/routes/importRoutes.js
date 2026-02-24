const express = require('express');
const multer = require('multer');
const ImportController = require('../controllers/importController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

// Multer config - store in memory
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/csv' ||
        file.mimetype === 'application/vnd.ms-excel' ||
        file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
        file.originalname.match(/\.(csv|xlsx?)$/i)) {
      cb(null, true);
    } else {
      cb(new Error('รองรับเฉพาะไฟล์ .csv, .xls, .xlsx'));
    }
  },
});

// POST /api/import/students - นำเข้านักศึกษาจากไฟล์ CSV/Excel (admin เท่านั้น)
router.post(
  '/students',
  authenticateToken,
  authorizeRoles('admin'),
  upload.single('file'),
  ImportController.importStudents
);

module.exports = router;
