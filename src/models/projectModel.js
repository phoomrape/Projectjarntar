const { pool } = require('../config/database');

class ProjectModel {
  static async findAll({ year, status, type, search, page = 1, limit = 50 } = {}) {
    let sql = 'SELECT * FROM projects WHERE 1=1';
    const params = [];

    if (year) { sql += ' AND year = ?'; params.push(year); }
    if (status) { sql += ' AND status = ?'; params.push(status); }
    if (type) { sql += ' AND type = ?'; params.push(type); }
    if (search) {
      sql += ' AND (title_th LIKE ? OR title_en LIKE ? OR project_id LIKE ? OR advisor LIKE ?)';
      const s = `%${search}%`;
      params.push(s, s, s, s);
    }

    const countSql = sql.replace('SELECT *', 'SELECT COUNT(*) as total');
    const [countRows] = await pool.query(countSql, params);
    const total = countRows[0].total;

    const offset = (page - 1) * limit;
    sql += ' ORDER BY id DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);

    const [rows] = await pool.query(sql, params);

    // Load members, tags for each project
    for (const project of rows) {
      const [members] = await pool.query('SELECT member_name FROM project_members WHERE project_id = ?', [project.id]);
      const [tags] = await pool.query('SELECT tag FROM project_tags WHERE project_id = ?', [project.id]);
      project.members = members.map(m => m.member_name);
      project.tags = tags.map(t => t.tag);
    }

    return { data: rows, total, page: parseInt(page), limit: parseInt(limit) };
  }

  static async findById(id) {
    const [rows] = await pool.query('SELECT * FROM projects WHERE id = ?', [id]);
    if (!rows[0]) return null;

    const project = rows[0];
    const [members] = await pool.query('SELECT member_name FROM project_members WHERE project_id = ?', [id]);
    const [tags] = await pool.query('SELECT tag FROM project_tags WHERE project_id = ?', [id]);
    const [comments] = await pool.query('SELECT * FROM project_comments WHERE project_id = ? ORDER BY created_at ASC', [id]);

    project.members = members.map(m => m.member_name);
    project.tags = tags.map(t => t.tag);
    project.comments = comments;

    return project;
  }

  static async create(data) {
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      const { members, tags, ...projectData } = data;

      const [result] = await conn.query(
        `INSERT INTO projects (project_id, title_th, title_en, description, advisor, year, document_url, status, type, has_award, created_by)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          projectData.project_id, projectData.title_th, projectData.title_en || '',
          projectData.description || '', projectData.advisor || '', projectData.year,
          projectData.document_url || '', projectData.status || 'Draft',
          projectData.type || 'individual', projectData.has_award || false,
          projectData.created_by || null
        ]
      );

      const projectId = result.insertId;

      if (members && members.length > 0) {
        const memberValues = members.map(m => [projectId, m]);
        await conn.query('INSERT INTO project_members (project_id, member_name) VALUES ?', [memberValues]);
      }

      if (tags && tags.length > 0) {
        const tagValues = tags.map(t => [projectId, t]);
        await conn.query('INSERT INTO project_tags (project_id, tag) VALUES ?', [tagValues]);
      }

      await conn.commit();
      return { id: projectId, project_id: projectData.project_id };
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

      const { members, tags, ...projectData } = data;

      const allowedFields = ['title_th', 'title_en', 'description', 'advisor', 'year', 'document_url', 'status', 'type', 'has_award'];
      const updates = [];
      const params = [];
      for (const [key, value] of Object.entries(projectData)) {
        if (allowedFields.includes(key)) {
          updates.push(`${key} = ?`);
          params.push(value);
        }
      }
      if (updates.length > 0) {
        params.push(id);
        await conn.query(`UPDATE projects SET ${updates.join(', ')} WHERE id = ?`, params);
      }

      if (members !== undefined) {
        await conn.query('DELETE FROM project_members WHERE project_id = ?', [id]);
        if (members.length > 0) {
          const memberValues = members.map(m => [id, m]);
          await conn.query('INSERT INTO project_members (project_id, member_name) VALUES ?', [memberValues]);
        }
      }

      if (tags !== undefined) {
        await conn.query('DELETE FROM project_tags WHERE project_id = ?', [id]);
        if (tags.length > 0) {
          const tagValues = tags.map(t => [id, t]);
          await conn.query('INSERT INTO project_tags (project_id, tag) VALUES ?', [tagValues]);
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

  static async addComment(projectId, { author_name, author_role, message }) {
    const [result] = await pool.query(
      'INSERT INTO project_comments (project_id, author_name, author_role, message) VALUES (?, ?, ?, ?)',
      [projectId, author_name, author_role, message]
    );
    return { id: result.insertId };
  }

  static async delete(id) {
    const [result] = await pool.query('DELETE FROM projects WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }
}

module.exports = ProjectModel;
