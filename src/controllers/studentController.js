const StudentService = require('../services/studentService');
const { validationResult } = require('express-validator');

class StudentController {
  // GET /api/students
  static async getAll(req, res, next) {
    try {
      const { faculty, department, status, search, page, limit } = req.query;
      const result = await StudentService.getAll({ faculty, department, status, search, page, limit });

      res.json({
        success: true,
        data: result.data,
        pagination: {
          total: result.total,
          page: result.page,
          limit: result.limit,
          totalPages: Math.ceil(result.total / result.limit),
        },
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/students/:id
  static async getById(req, res, next) {
    try {
      const student = await StudentService.getById(req.params.id);
      res.json({ success: true, data: student });
    } catch (error) {
      next(error);
    }
  }

  // POST /api/students
  static async create(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const student = await StudentService.create(req.body);
      res.status(201).json({
        success: true,
        message: 'เพิ่มนักศึกษาสำเร็จ',
        data: student,
      });
    } catch (error) {
      next(error);
    }
  }

  // PUT /api/students/:id
  static async update(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const student = await StudentService.update(req.params.id, req.body);
      res.json({
        success: true,
        message: 'อัปเดตข้อมูลนักศึกษาสำเร็จ',
        data: student,
      });
    } catch (error) {
      next(error);
    }
  }

  // PUT /api/students/status/batch
  static async updateStatus(req, res, next) {
    try {
      const { ids, status } = req.body;
      await StudentService.updateStatus(ids, status);
      res.json({ success: true, message: 'อัปเดตสถานะนักศึกษาสำเร็จ' });
    } catch (error) {
      next(error);
    }
  }

  // POST /api/students/graduate
  static async graduateStudents(req, res, next) {
    try {
      const { studentIds } = req.body;
      const alumni = await StudentService.graduateStudents(studentIds);
      res.json({
        success: true,
        message: `ย้ายนักศึกษา ${alumni.length} คนเป็นศิษย์เก่าสำเร็จ`,
        data: alumni,
      });
    } catch (error) {
      next(error);
    }
  }

  // DELETE /api/students/:id
  static async delete(req, res, next) {
    try {
      await StudentService.delete(req.params.id);
      res.json({ success: true, message: 'ลบนักศึกษาสำเร็จ' });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = StudentController;
