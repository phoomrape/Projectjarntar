const { pool } = require('../config/database');

class AlumniModel {
  static async findAll({ faculty, department, graduation_year, employment_status, search, page = 1, limit = 50 } = {}) {
    let sql = 'SELECT a.*, u.username FROM alumni a LEFT JOIN users u ON a.user_id = u.id WHERE 1=1';
    const params = [];

    if (faculty) { sql += ' AND a.faculty = ?'; params.push(faculty); }
    if (department) { sql += ' AND a.department = ?'; params.push(department); }
    if (graduation_year) { sql += ' AND a.graduation_year = ?'; params.push(graduation_year); }
    if (employment_status) { sql += ' AND a.employment_status = ?'; params.push(employment_status); }
    if (search) {
      sql += ' AND (a.first_name LIKE ? OR a.last_name LIKE ? OR a.alumni_id LIKE ? OR a.workplace LIKE ?)';
      const s = `%${search}%`;
      params.push(s, s, s, s);
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
    const [rows] = await pool.query('SELECT a.*, u.username FROM alumni a LEFT JOIN users u ON a.user_id = u.id WHERE a.id = ?', [id]);
    if (!rows[0]) return null;

    const alumni = rows[0];
    // Load related data
    const [skills] = await pool.query('SELECT skill FROM alumni_skills WHERE alumni_id = ?', [id]);
    const [education] = await pool.query('SELECT * FROM alumni_education WHERE alumni_id = ? ORDER BY id', [id]);
    const [experience] = await pool.query('SELECT * FROM alumni_experience WHERE alumni_id = ? ORDER BY id', [id]);
    const [customFields] = await pool.query('SELECT label, value FROM alumni_custom_fields WHERE alumni_id = ?', [id]);

    alumni.skills = skills.map(s => s.skill);
    alumni.education = education;
    alumni.experience = experience;
    alumni.custom_fields = customFields;

    return alumni;
  }

  static async create(data) {
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      const { skills, education, experience, custom_fields, ...alumniData } = data;

      const [result] = await conn.query(
        `INSERT INTO alumni (alumni_id, user_id, first_name, last_name, faculty, department, graduation_year,
         workplace, position, contact_info, portfolio, photo_url, employment_status, about_me, email, address, phone)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          alumniData.alumni_id, alumniData.user_id || null, alumniData.first_name, alumniData.last_name,
          alumniData.faculty, alumniData.department, alumniData.graduation_year,
          alumniData.workplace || '', alumniData.position || '', alumniData.contact_info || '',
          alumniData.portfolio || '', alumniData.photo_url || '', alumniData.employment_status || 'seeking',
          alumniData.about_me || '', alumniData.email || '', alumniData.address || '', alumniData.phone || ''
        ]
      );

      const alumniId = result.insertId;

      // Insert skills
      if (skills && skills.length > 0) {
        const skillValues = skills.map(s => [alumniId, s]);
        await conn.query('INSERT INTO alumni_skills (alumni_id, skill) VALUES ?', [skillValues]);
      }

      // Insert education
      if (education && education.length > 0) {
        const eduValues = education.map(e => [alumniId, e.years, e.institution, e.address || '', e.grade || '']);
        await conn.query('INSERT INTO alumni_education (alumni_id, years, institution, address, grade) VALUES ?', [eduValues]);
      }

      // Insert experience
      if (experience && experience.length > 0) {
        const expValues = experience.map(e => [alumniId, e.years, e.company, e.position]);
        await conn.query('INSERT INTO alumni_experience (alumni_id, years, company, position) VALUES ?', [expValues]);
      }

      // Insert custom fields
      if (custom_fields && custom_fields.length > 0) {
        const cfValues = custom_fields.map(cf => [alumniId, cf.label, cf.value]);
        await conn.query('INSERT INTO alumni_custom_fields (alumni_id, label, value) VALUES ?', [cfValues]);
      }

      await conn.commit();
      return { id: alumniId, alumni_id: alumniData.alumni_id };
    } catch (error) {
      await conn.rollback();
      throw error;
    } finally {
      conn.release();
    }
  }

  static async update(id, data) {
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      const { skills, education, experience, custom_fields, ...alumniData } = data;

      // Update main alumni fields
      const allowedFields = [
        'first_name', 'last_name', 'faculty', 'department', 'graduation_year',
        'workplace', 'position', 'contact_info', 'portfolio', 'photo_url',
        'employment_status', 'about_me', 'email', 'address', 'phone'
      ];
      const updates = [];
      const params = [];
      for (const [key, value] of Object.entries(alumniData)) {
        if (allowedFields.includes(key)) {
          updates.push(`${key} = ?`);
          params.push(value);
        }
      }
      if (updates.length > 0) {
        params.push(id);
        await conn.query(`UPDATE alumni SET ${updates.join(', ')} WHERE id = ?`, params);
      }

      // Replace skills
      if (skills !== undefined) {
        await conn.query('DELETE FROM alumni_skills WHERE alumni_id = ?', [id]);
        if (skills.length > 0) {
          const skillValues = skills.map(s => [id, s]);
          await conn.query('INSERT INTO alumni_skills (alumni_id, skill) VALUES ?', [skillValues]);
        }
      }

      // Replace education
      if (education !== undefined) {
        await conn.query('DELETE FROM alumni_education WHERE alumni_id = ?', [id]);
        if (education.length > 0) {
          const eduValues = education.map(e => [id, e.years, e.institution, e.address || '', e.grade || '']);
          await conn.query('INSERT INTO alumni_education (alumni_id, years, institution, address, grade) VALUES ?', [eduValues]);
        }
      }

      // Replace experience
      if (experience !== undefined) {
        await conn.query('DELETE FROM alumni_experience WHERE alumni_id = ?', [id]);
        if (experience.length > 0) {
          const expValues = experience.map(e => [id, e.years, e.company, e.position]);
          await conn.query('INSERT INTO alumni_experience (alumni_id, years, company, position) VALUES ?', [expValues]);
        }
      }

      // Replace custom fields
      if (custom_fields !== undefined) {
        await conn.query('DELETE FROM alumni_custom_fields WHERE alumni_id = ?', [id]);
        if (custom_fields.length > 0) {
          const cfValues = custom_fields.map(cf => [id, cf.label, cf.value]);
          await conn.query('INSERT INTO alumni_custom_fields (alumni_id, label, value) VALUES ?', [cfValues]);
        }
      }

      await conn.commit();
      return true;
    } catch (error) {
      await conn.rollback();
      throw error;
    } finally {
      conn.release();
    }
  }

  static async delete(id) {
    const [result] = await pool.query('DELETE FROM alumni WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }
}

module.exports = AlumniModel;
