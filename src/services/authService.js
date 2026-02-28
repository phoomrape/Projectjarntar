const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const UserModel = require('../models/userModel');
const { pool } = require('../config/database');

class AuthService {
  static async register({ username, password, role }) {
    // ตรวจสอบว่า username ซ้ำหรือไม่
    const existingUser = await UserModel.findByUsername(username);
    if (existingUser) {
      const error = new Error('Username นี้ถูกใช้งานแล้ว');
      error.statusCode = 409;
      throw error;
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    const user = await UserModel.create({ username, password_hash, role: role || 'student' });
    return user;
  }

  static async login({ username, password }) {
    const user = await UserModel.findByUsername(username);
    if (!user) {
      const error = new Error('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
      error.statusCode = 401;
      throw error;
    }

    if (!user.is_active) {
      const error = new Error('บัญชีถูกระงับการใช้งาน');
      error.statusCode = 403;
      throw error;
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      const error = new Error('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
      error.statusCode = 401;
      throw error;
    }

    // สร้าง JWT Token
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    return {
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
      },
    };
  }

  static async getProfile(userId) {
    const user = await UserModel.findById(userId);
    if (!user) {
      const error = new Error('ไม่พบผู้ใช้');
      error.statusCode = 404;
      throw error;
    }

    // Build profile based on role
    const profile = {
      id: user.id,
      username: user.username,
      role: user.role,
    };

    if (user.role === 'student') {
      const [rows] = await pool.query(
        'SELECT student_id, first_name, last_name, faculty, department, year, email, phone, address FROM students WHERE user_id = ?',
        [userId]
      );
      if (rows.length > 0) {
        Object.assign(profile, rows[0], { name: `${rows[0].first_name} ${rows[0].last_name}` });
      }
    } else if (user.role === 'advisor') {
      const [rows] = await pool.query(
        'SELECT advisor_id, name, faculty, department, email, phone FROM advisors WHERE user_id = ?',
        [userId]
      );
      if (rows.length > 0) {
        Object.assign(profile, rows[0]);
      }
    } else if (user.role === 'admin') {
      profile.name = 'ผู้ดูแลระบบ';
      profile.email = 'admin@sskru.ac.th';
    }

    // Check if user is alumni (alumni have user accounts with student role)
    const [alumniRows] = await pool.query(
      'SELECT alumni_id, first_name, last_name, faculty, department, email, phone, graduation_year, workplace, position FROM alumni WHERE user_id = ?',
      [userId]
    );
    if (alumniRows.length > 0) {
      Object.assign(profile, alumniRows[0], {
        name: `${alumniRows[0].first_name} ${alumniRows[0].last_name}`,
        is_alumni: true,
      });
    }

    return profile;
  }

  static async updateProfile(userId, { email, phone, address }) {
    const user = await UserModel.findById(userId);
    if (!user) {
      const error = new Error('ไม่พบผู้ใช้');
      error.statusCode = 404;
      throw error;
    }

    if (user.role === 'student') {
      const updates = [];
      const params = [];
      if (email !== undefined) { updates.push('email = ?'); params.push(email); }
      if (phone !== undefined) { updates.push('phone = ?'); params.push(phone); }
      if (address !== undefined) { updates.push('address = ?'); params.push(address); }
      if (updates.length > 0) {
        params.push(userId);
        await pool.query(`UPDATE students SET ${updates.join(', ')} WHERE user_id = ?`, params);
      }
    } else {
      const error = new Error('เฉพาะนักศึกษาเท่านั้นที่สามารถแก้ไขโปรไฟล์ได้');
      error.statusCode = 403;
      throw error;
    }

    return this.getProfile(userId);
  }

  static async changePassword(userId, { currentPassword, newPassword }) {
    const user = await UserModel.findByUsername(
      (await UserModel.findById(userId)).username
    );

    const fullUser = await UserModel.findByUsername(user.username);
    const isMatch = await bcrypt.compare(currentPassword, fullUser.password_hash);
    if (!isMatch) {
      const error = new Error('รหัสผ่านปัจจุบันไม่ถูกต้อง');
      error.statusCode = 400;
      throw error;
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(newPassword, salt);
    await UserModel.updatePassword(userId, password_hash);
    return true;
  }
}

module.exports = AuthService;
