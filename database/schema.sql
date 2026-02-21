-- =============================================
-- ระบบบริหารจัดการฝึกงานนักศึกษา - Database Schema
-- Database: internship_management
-- =============================================

DROP DATABASE IF EXISTS internship_management;

CREATE DATABASE internship_management
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE internship_management;

-- =============================================
-- ตาราง users - ผู้ใช้งานระบบ (3 บทบาท)
-- =============================================
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(100) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('student', 'advisor', 'admin') NOT NULL DEFAULT 'student',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- =============================================
-- ตาราง students - นักศึกษา
-- =============================================
CREATE TABLE IF NOT EXISTS students (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id VARCHAR(20) NOT NULL UNIQUE,
  user_id INT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  faculty VARCHAR(200) NOT NULL,
  department VARCHAR(200) NOT NULL,
  year INT NOT NULL,
  email VARCHAR(200) NOT NULL,
  phone VARCHAR(20) DEFAULT NULL,
  status ENUM('Active', 'Graduated', 'Suspended') NOT NULL DEFAULT 'Active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- =============================================
-- ตาราง advisors - อาจารย์ที่ปรึกษา
-- =============================================
CREATE TABLE IF NOT EXISTS advisors (
  id INT AUTO_INCREMENT PRIMARY KEY,
  advisor_id VARCHAR(20) NOT NULL UNIQUE,
  user_id INT NULL,
  name VARCHAR(200) NOT NULL,
  faculty VARCHAR(200) NOT NULL,
  department VARCHAR(200) NOT NULL,
  email VARCHAR(200) NOT NULL,
  phone VARCHAR(20) DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- =============================================
-- ตาราง alumni - ศิษย์เก่า
-- =============================================
CREATE TABLE IF NOT EXISTS alumni (
  id INT AUTO_INCREMENT PRIMARY KEY,
  alumni_id VARCHAR(20) NOT NULL UNIQUE,
  user_id INT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  faculty VARCHAR(200) NOT NULL,
  department VARCHAR(200) NOT NULL,
  graduation_year INT NOT NULL,
  workplace VARCHAR(300) DEFAULT '',
  position VARCHAR(200) DEFAULT '',
  contact_info VARCHAR(300) DEFAULT '',
  portfolio VARCHAR(500) DEFAULT '',
  photo_url VARCHAR(500) DEFAULT '',
  employment_status ENUM('employed', 'seeking') NOT NULL DEFAULT 'seeking',
  about_me TEXT DEFAULT NULL,
  email VARCHAR(200) DEFAULT '',
  address TEXT DEFAULT NULL,
  phone VARCHAR(20) DEFAULT '',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- =============================================
-- ตาราง alumni_skills - ทักษะของศิษย์เก่า
-- =============================================
CREATE TABLE IF NOT EXISTS alumni_skills (
  id INT AUTO_INCREMENT PRIMARY KEY,
  alumni_id INT NOT NULL,
  skill VARCHAR(200) NOT NULL,
  FOREIGN KEY (alumni_id) REFERENCES alumni(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- =============================================
-- ตาราง alumni_education - ประวัติการศึกษาของศิษย์เก่า
-- =============================================
CREATE TABLE IF NOT EXISTS alumni_education (
  id INT AUTO_INCREMENT PRIMARY KEY,
  alumni_id INT NOT NULL,
  years VARCHAR(50) NOT NULL,
  institution VARCHAR(300) NOT NULL,
  address TEXT DEFAULT NULL,
  grade VARCHAR(20) DEFAULT NULL,
  FOREIGN KEY (alumni_id) REFERENCES alumni(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- =============================================
-- ตาราง alumni_experience - ประสบการณ์ทำงานของศิษย์เก่า
-- =============================================
CREATE TABLE IF NOT EXISTS alumni_experience (
  id INT AUTO_INCREMENT PRIMARY KEY,
  alumni_id INT NOT NULL,
  years VARCHAR(50) NOT NULL,
  company VARCHAR(300) NOT NULL,
  position VARCHAR(200) NOT NULL,
  FOREIGN KEY (alumni_id) REFERENCES alumni(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- =============================================
-- ตาราง alumni_custom_fields - ข้อมูลเพิ่มเติมของศิษย์เก่า
-- =============================================
CREATE TABLE IF NOT EXISTS alumni_custom_fields (
  id INT AUTO_INCREMENT PRIMARY KEY,
  alumni_id INT NOT NULL,
  label VARCHAR(200) NOT NULL,
  value TEXT NOT NULL,
  FOREIGN KEY (alumni_id) REFERENCES alumni(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- =============================================
-- ตาราง projects - โครงงาน
-- =============================================
CREATE TABLE IF NOT EXISTS projects (
  id INT AUTO_INCREMENT PRIMARY KEY,
  project_id VARCHAR(30) NOT NULL UNIQUE,
  title_th VARCHAR(500) NOT NULL,
  title_en VARCHAR(500) DEFAULT '',
  description TEXT DEFAULT NULL,
  advisor VARCHAR(200) DEFAULT '',
  year INT NOT NULL,
  document_url VARCHAR(500) DEFAULT '',
  status ENUM('Draft', 'Approved', 'Completed') NOT NULL DEFAULT 'Draft',
  type ENUM('individual', 'group') NOT NULL DEFAULT 'individual',
  has_award BOOLEAN NOT NULL DEFAULT FALSE,
  created_by VARCHAR(100) DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- =============================================
-- ตาราง project_members - สมาชิกโครงงาน
-- =============================================
CREATE TABLE IF NOT EXISTS project_members (
  id INT AUTO_INCREMENT PRIMARY KEY,
  project_id INT NOT NULL,
  member_name VARCHAR(200) NOT NULL,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- =============================================
-- ตาราง project_tags - แท็กโครงงาน
-- =============================================
CREATE TABLE IF NOT EXISTS project_tags (
  id INT AUTO_INCREMENT PRIMARY KEY,
  project_id INT NOT NULL,
  tag VARCHAR(100) NOT NULL,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- =============================================
-- ตาราง project_comments - ความคิดเห็นโครงงาน
-- =============================================
CREATE TABLE IF NOT EXISTS project_comments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  project_id INT NOT NULL,
  author_name VARCHAR(200) NOT NULL,
  author_role VARCHAR(50) NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- =============================================
-- Indexes (ใช้ CREATE INDEX IF NOT EXISTS สำหรับ MySQL 8.0+)
-- สำหรับ MySQL เวอร์ชันต่ำกว่า จะไม่ error เพราะ DROP DATABASE ด้านบนลบทั้งหมดแล้ว
-- =============================================
ALTER TABLE students ADD INDEX idx_students_faculty (faculty);
ALTER TABLE students ADD INDEX idx_students_status (status);
ALTER TABLE alumni ADD INDEX idx_alumni_faculty (faculty);
ALTER TABLE alumni ADD INDEX idx_alumni_graduation_year (graduation_year);
ALTER TABLE projects ADD INDEX idx_projects_year (year);
ALTER TABLE projects ADD INDEX idx_projects_status (status);
ALTER TABLE users ADD INDEX idx_users_role (role);
