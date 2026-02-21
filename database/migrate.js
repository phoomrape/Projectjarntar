/**
 * Database Migration Script
 * รันเพื่อสร้างฐานข้อมูลและตาราง
 * Usage: node database/migrate.js
 */
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function migrate() {
  let connection;
  try {
    // เชื่อมต่อ MySQL โดยไม่ระบุ database (เพื่อสร้าง database ก่อน)
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT) || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      multipleStatements: true,
      charset: 'utf8mb4',
    });

    console.log('✅ เชื่อมต่อ MySQL สำเร็จ');

    // อ่านไฟล์ schema.sql
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf-8');

    console.log('📦 กำลังสร้างฐานข้อมูลและตาราง...');
    await connection.query(schemaSql);

    console.log('✅ สร้างฐานข้อมูลและตารางสำเร็จ!');
    console.log('');
    console.log('ตารางที่สร้าง:');
    console.log('  - users (ผู้ใช้งาน)');
    console.log('  - students (นักศึกษา)');
    console.log('  - advisors (อาจารย์ที่ปรึกษา)');
    console.log('  - alumni (ศิษย์เก่า)');
    console.log('  - alumni_skills');
    console.log('  - alumni_education');
    console.log('  - alumni_experience');
    console.log('  - alumni_custom_fields');
    console.log('  - projects (โครงงาน)');
    console.log('  - project_members');
    console.log('  - project_tags');
    console.log('  - project_comments');

  } catch (error) {
    console.error('❌ Migration ล้มเหลว:', error.message);
    process.exit(1);
  } finally {
    if (connection) await connection.end();
  }
}

migrate();
