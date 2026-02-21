const AlumniModel = require('../models/alumniModel');

class AlumniService {
  static async getAll(filters) {
    return AlumniModel.findAll(filters);
  }

  static async getById(id) {
    const alumni = await AlumniModel.findById(id);
    if (!alumni) {
      const error = new Error('ไม่พบข้อมูลศิษย์เก่า');
      error.statusCode = 404;
      throw error;
    }
    return alumni;
  }

  static async create(data) {
    return AlumniModel.create(data);
  }

  static async update(id, data) {
    const alumni = await AlumniModel.findById(id);
    if (!alumni) {
      const error = new Error('ไม่พบข้อมูลศิษย์เก่า');
      error.statusCode = 404;
      throw error;
    }
    await AlumniModel.update(id, data);
    return AlumniModel.findById(id);
  }

  static async delete(id) {
    const deleted = await AlumniModel.delete(id);
    if (!deleted) {
      const error = new Error('ไม่พบข้อมูลศิษย์เก่า');
      error.statusCode = 404;
      throw error;
    }
    return true;
  }
}

module.exports = AlumniService;
