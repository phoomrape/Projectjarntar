const AdvisorModel = require('../models/advisorModel');

class AdvisorService {
  static async getAll(filters) {
    return AdvisorModel.findAll(filters);
  }

  static async getById(id) {
    const advisor = await AdvisorModel.findById(id);
    if (!advisor) {
      const error = new Error('ไม่พบข้อมูลอาจารย์ที่ปรึกษา');
      error.statusCode = 404;
      throw error;
    }
    return advisor;
  }

  static async create(data) {
    return AdvisorModel.create(data);
  }

  static async update(id, data) {
    const advisor = await AdvisorModel.findById(id);
    if (!advisor) {
      const error = new Error('ไม่พบข้อมูลอาจารย์ที่ปรึกษา');
      error.statusCode = 404;
      throw error;
    }
    await AdvisorModel.update(id, data);
    return AdvisorModel.findById(id);
  }

  static async delete(id) {
    const deleted = await AdvisorModel.delete(id);
    if (!deleted) {
      const error = new Error('ไม่พบข้อมูลอาจารย์ที่ปรึกษา');
      error.statusCode = 404;
      throw error;
    }
    return true;
  }
}

module.exports = AdvisorService;
