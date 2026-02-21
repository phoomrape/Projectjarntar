const AdvisorService = require('../services/advisorService');
const { validationResult } = require('express-validator');

class AdvisorController {
  // GET /api/advisors
  static async getAll(req, res, next) {
    try {
      const { faculty, department, search, page, limit } = req.query;
      const result = await AdvisorService.getAll({ faculty, department, search, page, limit });

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

  // GET /api/advisors/:id
  static async getById(req, res, next) {
    try {
      const advisor = await AdvisorService.getById(req.params.id);
      res.json({ success: true, data: advisor });
    } catch (error) {
      next(error);
    }
  }

  // POST /api/advisors
  static async create(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const advisor = await AdvisorService.create(req.body);
      res.status(201).json({
        success: true,
        message: 'เพิ่มอาจารย์ที่ปรึกษาสำเร็จ',
        data: advisor,
      });
    } catch (error) {
      next(error);
    }
  }

  // PUT /api/advisors/:id
  static async update(req, res, next) {
    try {
      const advisor = await AdvisorService.update(req.params.id, req.body);
      res.json({
        success: true,
        message: 'อัปเดตข้อมูลอาจารย์ที่ปรึกษาสำเร็จ',
        data: advisor,
      });
    } catch (error) {
      next(error);
    }
  }

  // DELETE /api/advisors/:id
  static async delete(req, res, next) {
    try {
      await AdvisorService.delete(req.params.id);
      res.json({ success: true, message: 'ลบอาจารย์ที่ปรึกษาสำเร็จ' });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = AdvisorController;
