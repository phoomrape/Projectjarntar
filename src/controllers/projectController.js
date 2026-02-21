const ProjectService = require('../services/projectService');
const { validationResult } = require('express-validator');

class ProjectController {
  // GET /api/projects
  static async getAll(req, res, next) {
    try {
      const { year, status, type, search, page, limit } = req.query;
      const result = await ProjectService.getAll({ year, status, type, search, page, limit });

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

  // GET /api/projects/:id
  static async getById(req, res, next) {
    try {
      const project = await ProjectService.getById(req.params.id);
      res.json({ success: true, data: project });
    } catch (error) {
      next(error);
    }
  }

  // POST /api/projects
  static async create(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const project = await ProjectService.create(req.body);
      res.status(201).json({
        success: true,
        message: 'เพิ่มโครงงานสำเร็จ',
        data: project,
      });
    } catch (error) {
      next(error);
    }
  }

  // PUT /api/projects/:id
  static async update(req, res, next) {
    try {
      const project = await ProjectService.update(req.params.id, req.body);
      res.json({
        success: true,
        message: 'อัปเดตโครงงานสำเร็จ',
        data: project,
      });
    } catch (error) {
      next(error);
    }
  }

  // POST /api/projects/:id/comments
  static async addComment(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const comment = await ProjectService.addComment(req.params.id, req.body);
      res.status(201).json({
        success: true,
        message: 'เพิ่มความคิดเห็นสำเร็จ',
        data: comment,
      });
    } catch (error) {
      next(error);
    }
  }

  // DELETE /api/projects/:id
  static async delete(req, res, next) {
    try {
      await ProjectService.delete(req.params.id);
      res.json({ success: true, message: 'ลบโครงงานสำเร็จ' });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = ProjectController;
