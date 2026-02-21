const StudentModel = require('../models/studentModel');
const AlumniModel = require('../models/alumniModel');

class StudentService {
  static async getAll(filters) {
    return StudentModel.findAll(filters);
  }

  static async getById(id) {
    const student = await StudentModel.findById(id);
    if (!student) {
      const error = new Error('ไม่พบข้อมูลนักศึกษา');
      error.statusCode = 404;
      throw error;
    }
    return student;
  }

  static async create(data) {
    // ตรวจสอบ student_id ซ้ำ
    const existing = await StudentModel.findByStudentId(data.student_id);
    if (existing) {
      const error = new Error('รหัสนักศึกษานี้มีอยู่ในระบบแล้ว');
      error.statusCode = 409;
      throw error;
    }
    return StudentModel.create(data);
  }

  static async update(id, data) {
    const student = await StudentModel.findById(id);
    if (!student) {
      const error = new Error('ไม่พบข้อมูลนักศึกษา');
      error.statusCode = 404;
      throw error;
    }
    await StudentModel.update(id, data);
    return StudentModel.findById(id);
  }

  static async updateStatus(ids, status) {
    return StudentModel.updateStatus(ids, status);
  }

  static async delete(id) {
    const deleted = await StudentModel.delete(id);
    if (!deleted) {
      const error = new Error('ไม่พบข้อมูลนักศึกษา');
      error.statusCode = 404;
      throw error;
    }
    return true;
  }

  // ย้ายนักศึกษาเป็นศิษย์เก่า
  static async graduateStudents(studentIds) {
    const results = [];

    for (const studentId of studentIds) {
      const student = await StudentModel.findById(studentId);
      if (!student) continue;

      // สร้าง alumni จากข้อมูล student
      const alumniData = {
        alumni_id: student.student_id,
        user_id: student.user_id,
        first_name: student.first_name,
        last_name: student.last_name,
        faculty: student.faculty,
        department: student.department,
        graduation_year: new Date().getFullYear(),
        workplace: '',
        position: '',
        contact_info: student.email,
        email: student.email,
        phone: student.phone || '',
        employment_status: 'seeking',
        photo_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${student.student_id}`,
        skills: [],
        education: [],
        experience: [],
        custom_fields: [],
      };

      const alumni = await AlumniModel.create(alumniData);
      await StudentModel.delete(studentId);
      results.push(alumni);
    }

    return results;
  }
}

module.exports = StudentService;
