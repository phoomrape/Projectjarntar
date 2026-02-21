/**
 * Database Seed Runner Script - มหาวิทยาลัยราชภัฏศรีสะเกษ
 * คณะศิลปศาสตร์และวิทยาศาสตร์
 * รันเพื่อใส่ข้อมูลตัวอย่างลงฐานข้อมูล (รหัสผ่าน = เลขบัตรประชาชน)
 * Usage: node database/seedRunner.js
 */
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// =============================================
// ข้อมูลคณะและสาขา
// =============================================
const FACULTY = 'คณะศิลปศาสตร์และวิทยาศาสตร์';

const DEPARTMENTS = [
  'วิทยาการคอมพิวเตอร์',
  'เทคโนโลยีคอมพิวเตอร์และดิจิทัล',
  'สาธารณสุขชุมชน',
  'วิทยาศาสตร์การกีฬา',
  'เทคโนโลยีการเกษตร',
  'เทคโนโลยีและนวัตกรรมอาหาร',
  'อาชีวอนามัยและความปลอดภัย',
  'วิศวกรรมซอฟต์แวร์',
  'วิศวกรรมโลจิสติกส์',
  'วิศวกรรมการจัดการอุตสาหกรรมและสิ่งแวดล้อม',
  'การออกแบบผลิตภัณฑ์และนวัตกรรมวัสดุ',
  'เทคโนโลยีโยธาและสถาปัตยกรรม',
];

// =============================================
// ข้อมูลนักศึกษา (24 คน - 2 คนต่อสาขา)
// รหัสผ่าน = เลขบัตรประชาชน 13 หลัก
// =============================================
const STUDENTS = [
  // วิทยาการคอมพิวเตอร์
  { student_id: '6501010001', first_name: 'สมชาย', last_name: 'ศรีสะเกษ', department: 'วิทยาการคอมพิวเตอร์', year: 3, email: 'somchai.sr@sskru.ac.th', phone: '0812345001', status: 'Active', national_id: '1339900100011' },
  { student_id: '6501010002', first_name: 'สุดารัตน์', last_name: 'จันทร์แดง', department: 'วิทยาการคอมพิวเตอร์', year: 3, email: 'sudarat.ch@sskru.ac.th', phone: '0812345002', status: 'Active', national_id: '1339900100028' },

  // เทคโนโลยีคอมพิวเตอร์และดิจิทัล
  { student_id: '6501020001', first_name: 'ธนากร', last_name: 'วงษ์ประเสริฐ', department: 'เทคโนโลยีคอมพิวเตอร์และดิจิทัล', year: 3, email: 'thanakorn.wo@sskru.ac.th', phone: '0812345003', status: 'Active', national_id: '1339900100035' },
  { student_id: '6601020001', first_name: 'นภัสวรรณ', last_name: 'สมบูรณ์', department: 'เทคโนโลยีคอมพิวเตอร์และดิจิทัล', year: 2, email: 'napatsawan.so@sskru.ac.th', phone: '0812345004', status: 'Active', national_id: '1339900100042' },

  // สาธารณสุขชุมชน
  { student_id: '6501030001', first_name: 'วิภาวดี', last_name: 'แก้วมณี', department: 'สาธารณสุขชุมชน', year: 3, email: 'wipawadee.ka@sskru.ac.th', phone: '0812345005', status: 'Active', national_id: '1339900100059' },
  { student_id: '6601030001', first_name: 'ปิยะพงษ์', last_name: 'ทองคำ', department: 'สาธารณสุขชุมชน', year: 2, email: 'piyapong.th@sskru.ac.th', phone: '0812345006', status: 'Active', national_id: '1339900100066' },

  // วิทยาศาสตร์การกีฬา
  { student_id: '6501040001', first_name: 'กิตติพงศ์', last_name: 'บุญมา', department: 'วิทยาศาสตร์การกีฬา', year: 3, email: 'kittipong.bo@sskru.ac.th', phone: '0812345007', status: 'Active', national_id: '1339900100073' },
  { student_id: '6601040001', first_name: 'พิมพ์ชนก', last_name: 'ดวงดี', department: 'วิทยาศาสตร์การกีฬา', year: 2, email: 'pimchanok.du@sskru.ac.th', phone: '0812345008', status: 'Active', national_id: '1339900100080' },

  // เทคโนโลยีการเกษตร
  { student_id: '6501050001', first_name: 'อนุชา', last_name: 'พรมมา', department: 'เทคโนโลยีการเกษตร', year: 3, email: 'anucha.pr@sskru.ac.th', phone: '0812345009', status: 'Active', national_id: '1339900100097' },
  { student_id: '6601050001', first_name: 'รัตนาภรณ์', last_name: 'สุวรรณ', department: 'เทคโนโลยีการเกษตร', year: 2, email: 'rattanaporn.su@sskru.ac.th', phone: '0812345010', status: 'Active', national_id: '1339900100103' },

  // เทคโนโลยีและนวัตกรรมอาหาร
  { student_id: '6501060001', first_name: 'จิรายุ', last_name: 'สิงห์ทอง', department: 'เทคโนโลยีและนวัตกรรมอาหาร', year: 3, email: 'jirayu.si@sskru.ac.th', phone: '0812345011', status: 'Active', national_id: '1339900100110' },
  { student_id: '6601060001', first_name: 'ชลธิชา', last_name: 'ใจเย็น', department: 'เทคโนโลยีและนวัตกรรมอาหาร', year: 2, email: 'chonticha.ja@sskru.ac.th', phone: '0812345012', status: 'Active', national_id: '1339900100127' },

  // อาชีวอนามัยและความปลอดภัย
  { student_id: '6501070001', first_name: 'พัชรพล', last_name: 'เพชรดี', department: 'อาชีวอนามัยและความปลอดภัย', year: 3, email: 'patcharapol.pe@sskru.ac.th', phone: '0812345013', status: 'Active', national_id: '1339900100134' },
  { student_id: '6601070001', first_name: 'ศิริวรรณ', last_name: 'ชัยชนะ', department: 'อาชีวอนามัยและความปลอดภัย', year: 2, email: 'siriwan.ch@sskru.ac.th', phone: '0812345014', status: 'Active', national_id: '1339900100141' },

  // วิศวกรรมซอฟต์แวร์
  { student_id: '6501080001', first_name: 'ณัฐวุฒิ', last_name: 'มีสุข', department: 'วิศวกรรมซอฟต์แวร์', year: 3, email: 'natthawut.me@sskru.ac.th', phone: '0812345015', status: 'Active', national_id: '1339900100158' },
  { student_id: '6601080001', first_name: 'กมลวรรณ', last_name: 'ศรีลา', department: 'วิศวกรรมซอฟต์แวร์', year: 2, email: 'kamonwan.sr@sskru.ac.th', phone: '0812345016', status: 'Active', national_id: '1339900100165' },

  // วิศวกรรมโลจิสติกส์
  { student_id: '6501090001', first_name: 'วีระพงษ์', last_name: 'ทองแท้', department: 'วิศวกรรมโลจิสติกส์', year: 3, email: 'weerapong.th@sskru.ac.th', phone: '0812345017', status: 'Active', national_id: '1339900100172' },
  { student_id: '6601090001', first_name: 'อารียา', last_name: 'บุญเลิศ', department: 'วิศวกรรมโลจิสติกส์', year: 2, email: 'areeya.bo@sskru.ac.th', phone: '0812345018', status: 'Active', national_id: '1339900100189' },

  // วิศวกรรมการจัดการอุตสาหกรรมและสิ่งแวดล้อม
  { student_id: '6501100001', first_name: 'ภาคภูมิ', last_name: 'ยิ่งยง', department: 'วิศวกรรมการจัดการอุตสาหกรรมและสิ่งแวดล้อม', year: 3, email: 'pakpoom.yi@sskru.ac.th', phone: '0812345019', status: 'Active', national_id: '1339900100196' },
  { student_id: '6601100001', first_name: 'ดาริกา', last_name: 'แสงจันทร์', department: 'วิศวกรรมการจัดการอุตสาหกรรมและสิ่งแวดล้อม', year: 2, email: 'darika.sa@sskru.ac.th', phone: '0812345020', status: 'Active', national_id: '1339900100202' },

  // การออกแบบผลิตภัณฑ์และนวัตกรรมวัสดุ
  { student_id: '6501110001', first_name: 'ศักดิ์สิทธิ์', last_name: 'พลศรี', department: 'การออกแบบผลิตภัณฑ์และนวัตกรรมวัสดุ', year: 3, email: 'saksit.po@sskru.ac.th', phone: '0812345021', status: 'Active', national_id: '1339900100219' },
  { student_id: '6601110001', first_name: 'ปวีณา', last_name: 'รุ่งเรือง', department: 'การออกแบบผลิตภัณฑ์และนวัตกรรมวัสดุ', year: 2, email: 'paweena.ru@sskru.ac.th', phone: '0812345022', status: 'Active', national_id: '1339900100226' },

  // เทคโนโลยีโยธาและสถาปัตยกรรม
  { student_id: '6501120001', first_name: 'ชาญณรงค์', last_name: 'แก้วสุข', department: 'เทคโนโลยีโยธาและสถาปัตยกรรม', year: 3, email: 'channarong.ka@sskru.ac.th', phone: '0812345023', status: 'Active', national_id: '1339900100233' },
  { student_id: '6601120001', first_name: 'มัลลิกา', last_name: 'วิเศษ', department: 'เทคโนโลยีโยธาและสถาปัตยกรรม', year: 2, email: 'manlika.wi@sskru.ac.th', phone: '0812345024', status: 'Active', national_id: '1339900100240' },
];

// =============================================
// ข้อมูลศิษย์เก่า (12 คน - 1 คนต่อสาขา)
// =============================================
const ALUMNI = [
  { alumni_id: '6101010001', first_name: 'ประเสริฐ', last_name: 'ชำนาญกิจ', department: 'วิทยาการคอมพิวเตอร์', graduation_year: 2022, workplace: 'บริษัท กูเกิล (ประเทศไทย) จำกัด', position: 'Software Engineer', email: 'prasert.ch@gmail.com', phone: '0891234001', national_id: '1339900200011', skills: ['Python', 'JavaScript', 'React', 'Node.js', 'SQL'] },
  { alumni_id: '6101020001', first_name: 'สุรชัย', last_name: 'เพียรทำการ', department: 'เทคโนโลยีคอมพิวเตอร์และดิจิทัล', graduation_year: 2022, workplace: 'บริษัท ไมโครซอฟท์ (ประเทศไทย) จำกัด', position: 'System Administrator', email: 'surachai.pi@gmail.com', phone: '0891234002', national_id: '1339900200028', skills: ['Linux', 'Docker', 'Kubernetes', 'AWS', 'Networking'] },
  { alumni_id: '6101030001', first_name: 'จันทร์จิรา', last_name: 'สุขใจ', department: 'สาธารณสุขชุมชน', graduation_year: 2022, workplace: 'โรงพยาบาลศรีสะเกษ', position: 'นักวิชาการสาธารณสุข', email: 'chanjira.su@gmail.com', phone: '0891234003', national_id: '1339900200035', skills: ['การสาธารณสุข', 'ระบาดวิทยา', 'สุขศึกษา'] },
  { alumni_id: '6101040001', first_name: 'ธีรศักดิ์', last_name: 'กล้าหาญ', department: 'วิทยาศาสตร์การกีฬา', graduation_year: 2023, workplace: 'การกีฬาแห่งประเทศไทย', position: 'นักวิทยาศาสตร์การกีฬา', email: 'teerasak.kl@gmail.com', phone: '0891234004', national_id: '1339900200042', skills: ['Sports Science', 'Biomechanics', 'Fitness Training'] },
  { alumni_id: '6101050001', first_name: 'สมพร', last_name: 'ทุ่งกว้าง', department: 'เทคโนโลยีการเกษตร', graduation_year: 2023, workplace: 'สำนักงานเกษตรจังหวัดศรีสะเกษ', position: 'นักวิชาการเกษตร', email: 'somporn.tu@gmail.com', phone: '0891234005', national_id: '1339900200059', skills: ['Smart Farming', 'การจัดการพืช', 'IoT'] },
  { alumni_id: '6101060001', first_name: 'นิตยา', last_name: 'อิ่มใจ', department: 'เทคโนโลยีและนวัตกรรมอาหาร', graduation_year: 2023, workplace: 'บริษัท ซีพีเอฟ (ประเทศไทย) จำกัด', position: 'นักวิทยาศาสตร์อาหาร', email: 'nittaya.im@gmail.com', phone: '0891234006', national_id: '1339900200066', skills: ['Food Safety', 'HACCP', 'GMP', 'R&D'] },
  { alumni_id: '6101070001', first_name: 'วรรณา', last_name: 'ปลอดภัย', department: 'อาชีวอนามัยและความปลอดภัย', graduation_year: 2022, workplace: 'บริษัท ปตท. จำกัด (มหาชน)', position: 'เจ้าหน้าที่ความปลอดภัย (จป.)', email: 'wanna.pl@gmail.com', phone: '0891234007', national_id: '1339900200073', skills: ['ISO 45001', 'Risk Assessment', 'Fire Safety'] },
  { alumni_id: '6101080001', first_name: 'อภิชาติ', last_name: 'โค้ดเก่ง', department: 'วิศวกรรมซอฟต์แวร์', graduation_year: 2022, workplace: 'บริษัท LINE (ประเทศไทย) จำกัด', position: 'Full-Stack Developer', email: 'apichat.ko@gmail.com', phone: '0891234008', national_id: '1339900200080', skills: ['TypeScript', 'React', 'Node.js', 'MongoDB', 'Docker', 'CI/CD'] },
  { alumni_id: '6101090001', first_name: 'กำธร', last_name: 'ส่งไว', department: 'วิศวกรรมโลจิสติกส์', graduation_year: 2023, workplace: 'บริษัท เคอรี่ เอ็กซ์เพรส จำกัด', position: 'Logistics Analyst', email: 'kamtorn.so@gmail.com', phone: '0891234009', national_id: '1339900200097', skills: ['Supply Chain', 'SAP', 'Data Analysis', 'Lean Management'] },
  { alumni_id: '6101100001', first_name: 'สายฝน', last_name: 'รักษ์โลก', department: 'วิศวกรรมการจัดการอุตสาหกรรมและสิ่งแวดล้อม', graduation_year: 2023, workplace: 'กรมควบคุมมลพิษ', position: 'นักวิชาการสิ่งแวดล้อม', email: 'saifon.ra@gmail.com', phone: '0891234010', national_id: '1339900200103', skills: ['Environmental Management', 'ISO 14001', 'EIA'] },
  { alumni_id: '6101110001', first_name: 'พิชิต', last_name: 'สร้างสรรค์', department: 'การออกแบบผลิตภัณฑ์และนวัตกรรมวัสดุ', graduation_year: 2022, workplace: 'บริษัท เอสซีจี จำกัด', position: 'Product Designer', email: 'pichit.sa@gmail.com', phone: '0891234011', national_id: '1339900200110', skills: ['3D Modeling', 'AutoCAD', 'SolidWorks', 'Material Science'] },
  { alumni_id: '6101120001', first_name: 'เอกชัย', last_name: 'สถาปนา', department: 'เทคโนโลยีโยธาและสถาปัตยกรรม', graduation_year: 2023, workplace: 'บริษัท อิตาเลียนไทย ดีเวล๊อปเมนต์ จำกัด', position: 'Civil Engineer', email: 'ekkachai.sa@gmail.com', phone: '0891234012', national_id: '1339900200127', skills: ['AutoCAD', 'Revit', 'Structural Analysis', 'BIM'] },
];

// =============================================
// ข้อมูลอาจารย์ที่ปรึกษา (12 คน - 1 คนต่อสาขา)
// =============================================
const ADVISORS = [
  { advisor_id: 'T33001', name: 'ผศ.ดร.วิชัย เทคโนโลยี', department: 'วิทยาการคอมพิวเตอร์', email: 'wichai.te@sskru.ac.th', phone: '0451234001', national_id: '3339900100011' },
  { advisor_id: 'T33002', name: 'อ.ดร.ประภา ดิจิทัล', department: 'เทคโนโลยีคอมพิวเตอร์และดิจิทัล', email: 'prapa.di@sskru.ac.th', phone: '0451234002', national_id: '3339900100028' },
  { advisor_id: 'T33003', name: 'ผศ.สุขภาพ ชุมชนดี', department: 'สาธารณสุขชุมชน', email: 'sukhap.ch@sskru.ac.th', phone: '0451234003', national_id: '3339900100035' },
  { advisor_id: 'T33004', name: 'อ.ดร.กีฬา แข็งแรง', department: 'วิทยาศาสตร์การกีฬา', email: 'keela.kh@sskru.ac.th', phone: '0451234004', national_id: '3339900100042' },
  { advisor_id: 'T33005', name: 'ผศ.ดร.เกษตร ทุ่งทอง', department: 'เทคโนโลยีการเกษตร', email: 'kaset.tu@sskru.ac.th', phone: '0451234005', national_id: '3339900100059' },
  { advisor_id: 'T33006', name: 'อ.ดร.อาหาร สะอาด', department: 'เทคโนโลยีและนวัตกรรมอาหาร', email: 'ahan.sa@sskru.ac.th', phone: '0451234006', national_id: '3339900100066' },
  { advisor_id: 'T33007', name: 'ผศ.ความปลอดภัย มั่นคง', department: 'อาชีวอนามัยและความปลอดภัย', email: 'khwam.ma@sskru.ac.th', phone: '0451234007', national_id: '3339900100073' },
  { advisor_id: 'T33008', name: 'ผศ.ดร.ซอฟต์แวร์ พัฒนา', department: 'วิศวกรรมซอฟต์แวร์', email: 'software.pa@sskru.ac.th', phone: '0451234008', national_id: '3339900100080' },
  { advisor_id: 'T33009', name: 'อ.ดร.โลจิสติกส์ รวดเร็ว', department: 'วิศวกรรมโลจิสติกส์', email: 'logistic.ru@sskru.ac.th', phone: '0451234009', national_id: '3339900100097' },
  { advisor_id: 'T33010', name: 'ผศ.ดร.อุตสาหกรรม สีเขียว', department: 'วิศวกรรมการจัดการอุตสาหกรรมและสิ่งแวดล้อม', email: 'utsahakam.si@sskru.ac.th', phone: '0451234010', national_id: '3339900100103' },
  { advisor_id: 'T33011', name: 'อ.ดร.ออกแบบ สร้างสรรค์', department: 'การออกแบบผลิตภัณฑ์และนวัตกรรมวัสดุ', email: 'okbab.sa@sskru.ac.th', phone: '0451234011', national_id: '3339900100110' },
  { advisor_id: 'T33012', name: 'ผศ.โยธา ก่อสร้าง', department: 'เทคโนโลยีโยธาและสถาปัตยกรรม', email: 'yota.ko@sskru.ac.th', phone: '0451234012', national_id: '3339900100127' },
];

// =============================================
// ข้อมูลโครงงาน
// =============================================
const PROJECTS = [
  {
    project_id: 'PRJ2568001', title_th: 'ระบบบริหารจัดการฝึกงานนักศึกษาออนไลน์', title_en: 'Online Student Internship Management System',
    description: 'พัฒนาระบบเว็บแอปพลิเคชันสำหรับบริหารจัดการการฝึกงานของนักศึกษา รองรับการลงทะเบียน ติดตามสถานะ และประเมินผล',
    advisor_dept: 'วิศวกรรมซอฟต์แวร์', year: 2025, status: 'Completed', type: 'group', has_award: true,
    members: ['ณัฐวุฒิ มีสุข', 'กมลวรรณ ศรีลา'], tags: ['Web Application', 'Cloud Computing'],
  },
  {
    project_id: 'PRJ2568002', title_th: 'แอปพลิเคชันติดตามสุขภาพชุมชน', title_en: 'Community Health Tracking Application',
    description: 'แอปพลิเคชันมือถือสำหรับติดตามข้อมูลสุขภาพของคนในชุมชน และแจ้งเตือนการระบาดของโรค',
    advisor_dept: 'สาธารณสุขชุมชน', year: 2025, status: 'Approved', type: 'group', has_award: false,
    members: ['วิภาวดี แก้วมณี', 'ปิยะพงษ์ ทองคำ'], tags: ['Mobile App', 'Data Science'],
  },
  {
    project_id: 'PRJ2568003', title_th: 'ระบบ IoT สำหรับเกษตรอัจฉริยะ', title_en: 'IoT System for Smart Agriculture',
    description: 'ระบบ IoT สำหรับตรวจวัดความชื้นและอุณหภูมิในแปลงเกษตร พร้อมระบบรดน้ำอัตโนมัติ',
    advisor_dept: 'เทคโนโลยีการเกษตร', year: 2025, status: 'Completed', type: 'group', has_award: true,
    members: ['อนุชา พรมมา', 'รัตนาภรณ์ สุวรรณ'], tags: ['IoT', 'AI/ML'],
  },
  {
    project_id: 'PRJ2568004', title_th: 'ระบบวิเคราะห์ประสิทธิภาพนักกีฬาด้วย AI', title_en: 'AI-based Athlete Performance Analysis',
    description: 'ระบบวิเคราะห์ท่าทางและประสิทธิภาพนักกีฬาโดยใช้ Computer Vision และ Machine Learning',
    advisor_dept: 'วิทยาศาสตร์การกีฬา', year: 2025, status: 'Draft', type: 'individual', has_award: false,
    members: ['กิตติพงศ์ บุญมา'], tags: ['AI/ML', 'Data Science'],
  },
  {
    project_id: 'PRJ2568005', title_th: 'ระบบจัดการคลังสินค้าอัจฉริยะ', title_en: 'Smart Warehouse Management System',
    description: 'ระบบบริหารจัดการคลังสินค้าโดยใช้เทคโนโลยี RFID และ Barcode Scanner',
    advisor_dept: 'วิศวกรรมโลจิสติกส์', year: 2025, status: 'Approved', type: 'group', has_award: false,
    members: ['วีระพงษ์ ทองแท้', 'อารียา บุญเลิศ'], tags: ['IoT', 'Web Application'],
  },
  {
    project_id: 'PRJ2568006', title_th: 'เว็บแอปตรวจสอบคุณภาพอาหารด้วย QR Code', title_en: 'Food Quality Verification Web App via QR Code',
    description: 'ระบบตรวจสอบย้อนกลับคุณภาพอาหารตั้งแต่ฟาร์มจนถึงมือผู้บริโภคผ่าน QR Code',
    advisor_dept: 'เทคโนโลยีและนวัตกรรมอาหาร', year: 2025, status: 'Completed', type: 'group', has_award: false,
    members: ['จิรายุ สิงห์ทอง', 'ชลธิชา ใจเย็น'], tags: ['Web Application', 'Blockchain'],
  },
];

// =============================================
// ฟังก์ชันหลัก
// =============================================
async function seed() {
  let connection;
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT) || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'internship_management',
      charset: 'utf8mb4',
    });

    console.log('✅ เชื่อมต่อฐานข้อมูลสำเร็จ');
    console.log('🧹 กำลังล้างข้อมูลเดิม...');

    // ล้างข้อมูลเดิม (ตาม foreign key order)
    await connection.query('SET FOREIGN_KEY_CHECKS = 0');
    await connection.query('TRUNCATE TABLE project_comments');
    await connection.query('TRUNCATE TABLE project_tags');
    await connection.query('TRUNCATE TABLE project_members');
    await connection.query('TRUNCATE TABLE projects');
    await connection.query('TRUNCATE TABLE alumni_custom_fields');
    await connection.query('TRUNCATE TABLE alumni_experience');
    await connection.query('TRUNCATE TABLE alumni_education');
    await connection.query('TRUNCATE TABLE alumni_skills');
    await connection.query('TRUNCATE TABLE alumni');
    await connection.query('TRUNCATE TABLE advisors');
    await connection.query('TRUNCATE TABLE students');
    await connection.query('TRUNCATE TABLE users');
    await connection.query('SET FOREIGN_KEY_CHECKS = 1');

    console.log('🌱 กำลังใส่ข้อมูลตัวอย่าง...\n');

    // =============================================
    // 1. สร้าง Admin
    // =============================================
    const adminHash = await bcrypt.hash('admin123', 10);
    const [adminResult] = await connection.query(
      'INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)',
      ['admin', adminHash, 'admin']
    );
    console.log('👤 สร้าง Admin: admin / admin123');

    // =============================================
    // 2. สร้างนักศึกษา (password = เลขบัตรประชาชน)
    // =============================================
    console.log('\n📚 กำลังสร้างนักศึกษา...');
    for (const s of STUDENTS) {
      const hash = await bcrypt.hash(s.national_id, 10);
      const [userResult] = await connection.query(
        'INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)',
        [s.student_id, hash, 'student']
      );
      await connection.query(
        `INSERT INTO students (student_id, user_id, first_name, last_name, faculty, department, year, email, phone, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [s.student_id, userResult.insertId, s.first_name, s.last_name, FACULTY, s.department, s.year, s.email, s.phone, s.status]
      );
      console.log(`   ✅ ${s.student_id} ${s.first_name} ${s.last_name} (${s.department}) - รหัสผ่าน: ${s.national_id}`);
    }

    // =============================================
    // 3. สร้างศิษย์เก่า (password = เลขบัตรประชาชน)
    // =============================================
    console.log('\n🎓 กำลังสร้างศิษย์เก่า...');
    for (const a of ALUMNI) {
      const hash = await bcrypt.hash(a.national_id, 10);
      const [userResult] = await connection.query(
        'INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)',
        [a.alumni_id, hash, 'student']
      );
      const [alumniResult] = await connection.query(
        `INSERT INTO alumni (alumni_id, user_id, first_name, last_name, faculty, department, graduation_year,
         workplace, position, contact_info, email, phone, employment_status, photo_url)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [a.alumni_id, userResult.insertId, a.first_name, a.last_name, FACULTY, a.department, a.graduation_year,
         a.workplace, a.position, a.email, a.email, a.phone, 'employed',
         `https://api.dicebear.com/7.x/avataaars/svg?seed=${a.alumni_id}`]
      );

      // ใส่ skills
      if (a.skills && a.skills.length > 0) {
        for (const skill of a.skills) {
          await connection.query('INSERT INTO alumni_skills (alumni_id, skill) VALUES (?, ?)', [alumniResult.insertId, skill]);
        }
      }

      console.log(`   ✅ ${a.alumni_id} ${a.first_name} ${a.last_name} (${a.department}) - รหัสผ่าน: ${a.national_id}`);
    }

    // =============================================
    // 4. สร้างอาจารย์ที่ปรึกษา (password = เลขบัตรประชาชน)
    // =============================================
    console.log('\n👨‍🏫 กำลังสร้างอาจารย์ที่ปรึกษา...');
    for (const adv of ADVISORS) {
      const hash = await bcrypt.hash(adv.national_id, 10);
      const [userResult] = await connection.query(
        'INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)',
        [adv.advisor_id, hash, 'advisor']
      );
      await connection.query(
        `INSERT INTO advisors (advisor_id, user_id, name, faculty, department, email, phone)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [adv.advisor_id, userResult.insertId, adv.name, FACULTY, adv.department, adv.email, adv.phone]
      );
      console.log(`   ✅ ${adv.advisor_id} ${adv.name} (${adv.department}) - รหัสผ่าน: ${adv.national_id}`);
    }

    // =============================================
    // 5. สร้างโครงงาน
    // =============================================
    console.log('\n📋 กำลังสร้างโครงงาน...');
    for (const p of PROJECTS) {
      // หาอาจารย์ที่ตรงกับสาขา
      const advisor = ADVISORS.find(a => a.department === p.advisor_dept);

      const [projResult] = await connection.query(
        `INSERT INTO projects (project_id, title_th, title_en, description, advisor, year, document_url, status, type, has_award)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [p.project_id, p.title_th, p.title_en, p.description, advisor ? advisor.name : '', p.year, '', p.status, p.type, p.has_award]
      );

      const projId = projResult.insertId;

      // ใส่ members
      for (const member of p.members) {
        await connection.query('INSERT INTO project_members (project_id, member_name) VALUES (?, ?)', [projId, member]);
      }

      // ใส่ tags
      for (const tag of p.tags) {
        await connection.query('INSERT INTO project_tags (project_id, tag) VALUES (?, ?)', [projId, tag]);
      }

      // ใส่ comment จากอาจารย์
      if (advisor) {
        await connection.query(
          'INSERT INTO project_comments (project_id, author_name, author_role, message) VALUES (?, ?, ?, ?)',
          [projId, advisor.name, 'advisor', `โครงงาน "${p.title_th}" มีความก้าวหน้าดี ขอให้ดำเนินการต่อไป`]
        );
      }

      console.log(`   ✅ ${p.project_id} - ${p.title_th}`);
    }

    // =============================================
    // สรุป
    // =============================================
    console.log('\n' + '='.repeat(70));
    console.log('✅ ใส่ข้อมูลตัวอย่างสำเร็จ!');
    console.log('='.repeat(70));
    console.log(`   คณะ: ${FACULTY}`);
    console.log(`   สาขา: ${DEPARTMENTS.length} สาขา`);
    console.log(`   นักศึกษา: ${STUDENTS.length} คน`);
    console.log(`   ศิษย์เก่า: ${ALUMNI.length} คน`);
    console.log(`   อาจารย์: ${ADVISORS.length} คน`);
    console.log(`   โครงงาน: ${PROJECTS.length} โครงงาน`);
    console.log('='.repeat(70));
    console.log('\n📋 บัญชีทดสอบ:');
    console.log('   Admin:    username=admin         password=admin123');
    console.log('   Student:  username=6501080001    password=1339900100158');
    console.log('   Alumni:   username=6101080001    password=1339900200080');
    console.log('   Advisor:  username=T33008        password=3339900100080');
    console.log('\n💡 รหัสผ่านของทุกคน = เลขบัตรประชาชน 13 หลัก (ดูรายละเอียดด้านบน)');

  } catch (error) {
    console.error('❌ Seed ล้มเหลว:', error.message);
    if (error.sql) console.error('SQL:', error.sql);
    process.exit(1);
  } finally {
    if (connection) await connection.end();
  }
}

seed();
