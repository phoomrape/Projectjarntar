const { pool } = require('../config/database');

class UserModel {
  static async findAll() {
    const [rows] = await pool.query('SELECT id, username, role, is_active, created_at FROM users ORDER BY id');
    return rows;
  }

  static async findById(id) {
    const [rows] = await pool.query('SELECT id, username, role, is_active, created_at FROM users WHERE id = ?', [id]);
    return rows[0] || null;
  }

  static async findByUsername(username) {
    const [rows] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);
    return rows[0] || null;
  }

  static async create({ username, password_hash, role }) {
    const [result] = await pool.query(
      'INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)',
      [username, password_hash, role]
    );
    return { id: result.insertId, username, role };
  }

  static async updatePassword(id, password_hash) {
    await pool.query('UPDATE users SET password_hash = ? WHERE id = ?', [password_hash, id]);
  }

  static async toggleActive(id, is_active) {
    await pool.query('UPDATE users SET is_active = ? WHERE id = ?', [is_active, id]);
  }

  static async delete(id) {
    await pool.query('DELETE FROM users WHERE id = ?', [id]);
  }
}

module.exports = UserModel;
