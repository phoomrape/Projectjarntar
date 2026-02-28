const csv = require('csv-parser');
const xlsx = require('xlsx');
const { Readable } = require('stream');
const bcrypt = require('bcryptjs');
const { pool } = require('../config/database');

class ImportController {
  /**
   * POST /api/import/students
   * รับไฟล์ CSV/Excel แล้วนำเข้านักศึกษาพร้อมสร้าง user
   */
  static async importStudents(req, res, next) {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, message: 'กรุณาอัปโหลดไฟล์' });
      }

      const file = req.file;
      let rows = [];

      // Parse file based on type
      if (file.originalname.endsWith('.csv')) {
        rows = await ImportController.parseCSV(file.buffer);
      } else if (file.originalname.match(/\.xlsx?$/)) {
        rows = ImportController.parseExcel(file.buffer);
      } else {
        return res.status(400).json({ success: false, message: 'รองรับเฉพาะไฟล์ .csv, .xls, .xlsx' });
      }

      if (rows.length === 0) {
        return res.status(400).json({ success: false, message: 'ไม่พบข้อมูลในไฟล์' });
      }

      // Map Thai column headers to English field names
      const headerMap = {
        'รหัสนักศึกษา': 'student_id',
        'ชื่อ': 'first_name',
        'นามสกุล': 'last_name',
        'คณะ': 'faculty',
        'สาขา': 'department',
        'ชั้นปี': 'year',
        'อีเมล': 'email',
        'เบอร์โทร': 'phone',
        'สถานะ': 'status',
        'ที่อยู่': 'address',
        'รหัสผ่าน': 'password',
        // English fallbacks
        'student_id': 'student_id',
        'first_name': 'first_name',
        'last_name': 'last_name',
        'faculty': 'faculty',
        'department': 'department',
        'year': 'year',
        'email': 'email',
        'phone': 'phone',
        'status': 'status',
        'address': 'address',
        'password': 'password',
      };

      // Normalize rows
      const normalizedRows = rows.map((row, index) => {
        const normalized = {};
        for (const [key, value] of Object.entries(row)) {
          const cleanKey = key.trim().replace(/^\uFEFF/, ''); // Remove BOM
          const fieldName = headerMap[cleanKey] || cleanKey;
          normalized[fieldName] = typeof value === 'string' ? value.trim() : value;
        }
        normalized._rowIndex = index + 2; // +2 because header is row 1
        return normalized;
      });

      // Validate rows
      const errors = [];
      const validRows = [];

      for (const row of normalizedRows) {
        const rowErrors = [];

        if (!row.student_id) rowErrors.push('ไม่มีรหัสนักศึกษา');
        if (!row.first_name) rowErrors.push('ไม่มีชื่อ');
        if (!row.last_name) rowErrors.push('ไม่มีนามสกุล');
        if (!row.faculty) rowErrors.push('ไม่มีคณะ');
        if (!row.department) rowErrors.push('ไม่มีสาขา');
        if (!row.year) rowErrors.push('ไม่มีชั้นปี');

        if (rowErrors.length > 0) {
          errors.push({ row: row._rowIndex, student_id: row.student_id || '-', errors: rowErrors });
        } else {
          validRows.push(row);
        }
      }

      // Process valid rows  
      let imported = 0;
      let skipped = 0;
      const skippedDetails = [];

      // Get raw (non-promise) pool to get a proper connection for transactions
      const connection = await pool.getConnection();
      try {
        await connection.beginTransaction();

        for (const row of validRows) {
          try {
            // Check if student_id already exists
            const [existing] = await connection.query(
              'SELECT id FROM students WHERE student_id = ?',
              [String(row.student_id)]
            );

            if (existing.length > 0) {
              skipped++;
              skippedDetails.push({ row: row._rowIndex, student_id: String(row.student_id), reason: 'รหัสนักศึกษาซ้ำในระบบ' });
              continue;
            }

            // Create user account (username = student_id)
            const username = String(row.student_id);
            const password = row.password || String(row.student_id); // Default password = student_id
            const password_hash = await bcrypt.hash(password, 10);

            // Check if username already exists
            const [existingUser] = await connection.query(
              'SELECT id FROM users WHERE username = ?',
              [username]
            );

            let userId;
            if (existingUser.length > 0) {
              userId = existingUser[0].id;
            } else {
              const [userResult] = await connection.query(
                'INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)',
                [username, password_hash, 'student']
              );
              userId = userResult.insertId;
            }

            // Create student record
            await connection.query(
              `INSERT INTO students (student_id, user_id, first_name, last_name, faculty, department, year, email, phone, status)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
              [
                String(row.student_id),
                userId,
                row.first_name,
                row.last_name,
                row.faculty,
                row.department,
                parseInt(row.year) || 1,
                row.email || `${row.student_id}@sskru.ac.th`,
                row.phone || null,
                row.status || 'Active',
              ]
            );

            imported++;
          } catch (err) {
            skipped++;
            skippedDetails.push({
              row: row._rowIndex,
              student_id: String(row.student_id),
              reason: err.message,
            });
          }
        }

        await connection.commit();
      } catch (err) {
        try {
          await connection.rollback();
        } catch (rollbackErr) {
          console.error('Rollback failed:', rollbackErr.message);
        }
        throw err;
      } finally {
        try {
          connection.release();
        } catch (releaseErr) {
          console.error('Release failed:', releaseErr.message);
        }
      }

      res.json({
        success: true,
        message: `นำเข้าข้อมูลสำเร็จ ${imported} รายการ`,
        data: {
          total: normalizedRows.length,
          imported,
          skipped,
          validationErrors: errors,
          skippedDetails,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Parse CSV buffer
   */
  static parseCSV(buffer) {
    return new Promise((resolve, reject) => {
      const rows = [];
      const stream = Readable.from(buffer);
      stream
        .pipe(csv())
        .on('data', (row) => rows.push(row))
        .on('end', () => resolve(rows))
        .on('error', reject);
    });
  }

  /**
   * Parse Excel buffer
   */
  static parseExcel(buffer) {
    const workbook = xlsx.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    return xlsx.utils.sheet_to_json(sheet, { defval: '' });
  }
}

module.exports = ImportController;
