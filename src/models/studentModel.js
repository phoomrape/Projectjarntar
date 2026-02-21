const { pool } = require('../config/database');

class StudentModel {
  static async findAll({ faculty, department, status, search, page = 1, limit = 50 } = {}) {
    let sql = 'SELECT s.*, u.username FROM students s LEFT JOIN users u ON s.user_id = u.id WHERE 1=1';
    const params = [];

    if (faculty) {
      sql += ' AND s.faculty = ?';
      params.push(faculty);
    }
    if (department) {
      sql += ' AND s.department = ?';
      params.push(department);
    }
    if (status) {
      sql += ' AND s.status = ?';
      params.push(status);
    }
    if (search) {
      sql += ' AND (s.first_name LIKE ? OR s.last_name LIKE ? OR s.student_id LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    // Count total
    const countSql = sql.replace('SELECT s.*, u.username', 'SELECT COUNT(*) as total');
    const [countRows] = await pool.query(countSql, params);
    const total = countRows[0].total;

    // Pagination
    const offset = (page - 1) * limit;
    sql += ' ORDER BY s.id DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);

    const [rows] = await pool.query(sql, params);
    return { data: rows, total, page: parseInt(page), limit: parseInt(limit) };
  }

  static async findById(id) {
    const [rows] = await pool.query(
      'SELECT s.*, u.username FROM students s LEFT JOIN users u ON s.user_id = u.id WHERE s.id = ?',
      [id]
    );
    return rows[0] || null;
  }

  static async findByStudentId(studentId) {
    const [rows] = await pool.query(
      'SELECT s.*, u.username FROM students s LEFT JOIN users u ON s.user_id = u.id WHERE s.student_id = ?',
      [studentId]
    );
    return rows[0] || null;
  }

  static async create({ student_id, user_id, first_name, last_name, faculty, department, year, email, phone, status = 'Active' }) {
    const [result] = await pool.query(
      `INSERT INTO students (student_id, user_id, first_name, last_name, faculty, department, year, email, phone, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [student_id, user_id || null, first_name, last_name, faculty, department, year, email, phone || null, status]
    );
    return { id: result.insertId, student_id };
  }

  static async update(id, fields) {
    const allowedFields = ['first_name', 'last_name', 'faculty', 'department', 'year', 'email', 'phone', 'status'];
    const updates = [];
    const params = [];

    for (const [key, value] of Object.entries(fields)) {
      if (allowedFields.includes(key)) {
        updates.push(`${key} = ?`);
        params.push(value);
      }
    }

    if (updates.length === 0) return false;

    params.push(id);
    await pool.query(`UPDATE students SET ${updates.join(', ')} WHERE id = ?`, params);
    return true;
  }

  static async updateStatus(ids, status) {
    if (!Array.isArray(ids) || ids.length === 0) return false;
    const placeholders = ids.map(() => '?').join(', ');
    await pool.query(`UPDATE students SET status = ? WHERE id IN (${placeholders})`, [status, ...ids]);
    return true;
  }

  static async delete(id) {
    const [result] = await pool.query('DELETE FROM students WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }
}

module.exports = StudentModel;
