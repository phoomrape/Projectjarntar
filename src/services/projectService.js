const ProjectModel = require('../models/projectModel');

class ProjectService {
  static async getAll(filters) {
    return ProjectModel.findAll(filters);
  }

  static async getById(id) {
    const project = await ProjectModel.findById(id);
    if (!project) {
      const error = new Error('ไม่พบโครงงาน');
      error.statusCode = 404;
      throw error;
    }
    return project;
  }

  static async create(data) {
    return ProjectModel.create(data);
  }

  static async update(id, data) {
    const project = await ProjectModel.findById(id);
    if (!project) {
      const error = new Error('ไม่พบโครงงาน');
      error.statusCode = 404;
      throw error;
    }
    await ProjectModel.update(id, data);
    return ProjectModel.findById(id);
  }

  static async addComment(projectId, commentData) {
    const project = await ProjectModel.findById(projectId);
    if (!project) {
      const error = new Error('ไม่พบโครงงาน');
      error.statusCode = 404;
      throw error;
    }
    return ProjectModel.addComment(projectId, commentData);
  }

  static async delete(id) {
    const deleted = await ProjectModel.delete(id);
    if (!deleted) {
      const error = new Error('ไม่พบโครงงาน');
      error.statusCode = 404;
      throw error;
    }
    return true;
  }
}

module.exports = ProjectService;
