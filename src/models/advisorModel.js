const { pool } = require('../config/database');

class AdvisorModel {
  static async findAll({ faculty, department, search, page = 1, limit = 50 } = {}) {
    let sql = 'SELECT a.*, u.username FROM advisors a LEFT JOIN users u ON a.user_id = u.id WHERE 1=1';
    const params = [];

    if (faculty) { sql += ' AND a.faculty = ?'; params.push(faculty); }
    if (department) { sql += ' AND a.department = ?'; params.push(department); }
    if (search) {
      sql += ' AND (a.name LIKE ? OR a.advisor_id LIKE ? OR a.email LIKE ?)';
      const s = `%${search}%`;
      params.push(s, s, s);
    }

    const countSql = sql.replace('SELECT a.*, u.username', 'SELECT COUNT(*) as total');
    const [countRows] = await pool.query(countSql, params);
    const total = countRows[0].total;

    const offset = (page - 1) * limit;
    sql += ' ORDER BY a.id DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);

    const [rows] = await pool.query(sql, params);
    return { data: rows, total, page: parseInt(page), limit: parseInt(limit) };
  }

  static async findById(id) {
    const [rows] = await pool.query(
      'SELECT a.*, u.username FROM advisors a LEFT JOIN users u ON a.user_id = u.id WHERE a.id = ?',
      [id]
    );
    return rows[0] || null;
  }

  static async create({ advisor_id, user_id, name, faculty, department, email, phone }) {
    const [result] = await pool.query(
      'INSERT INTO advisors (advisor_id, user_id, name, faculty, department, email, phone) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [advisor_id, user_id || null, name, faculty, department, email, phone || null]
    );
    return { id: result.insertId, advisor_id };
  }

  static async update(id, fields) {
    const allowedFields = ['name', 'faculty', 'department', 'email', 'phone'];
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
    await pool.query(`UPDATE advisors SET ${updates.join(', ')} WHERE id = ?`, params);
    return true;
  }

  static async delete(id) {
    const [result] = await pool.query('DELETE FROM advisors WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }
}

module.exports = AdvisorModel;
