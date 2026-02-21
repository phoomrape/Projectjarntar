const AlumniService = require('../services/alumniService');
const { validationResult } = require('express-validator');

class AlumniController {
  // GET /api/alumni
  static async getAll(req, res, next) {
    try {
      const { faculty, department, graduation_year, employment_status, search, page, limit } = req.query;
      const result = await AlumniService.getAll({ faculty, department, graduation_year, employment_status, search, page, limit });

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

  // GET /api/alumni/:id
  static async getById(req, res, next) {
    try {
      const alumni = await AlumniService.getById(req.params.id);
      res.json({ success: true, data: alumni });
    } catch (error) {
      next(error);
    }
  }

  // POST /api/alumni
  static async create(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const alumni = await AlumniService.create(req.body);
      res.status(201).json({
        success: true,
        message: 'เพิ่มศิษย์เก่าสำเร็จ',
        data: alumni,
      });
    } catch (error) {
      next(error);
    }
  }

  // PUT /api/alumni/:id
  static async update(req, res, next) {
    try {
      const alumni = await AlumniService.update(req.params.id, req.body);
      res.json({
        success: true,
        message: 'อัปเดตข้อมูลศิษย์เก่าสำเร็จ',
        data: alumni,
      });
    } catch (error) {
      next(error);
    }
  }

  // DELETE /api/alumni/:id
  static async delete(req, res, next) {
    try {
      await AlumniService.delete(req.params.id);
      res.json({ success: true, message: 'ลบศิษย์เก่าสำเร็จ' });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = AlumniController;
