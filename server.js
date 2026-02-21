require('dotenv').config();
const app = require('./src/app');
const { testConnection } = require('./src/config/database');

const PORT = process.env.PORT || 3000;

async function startServer() {
  // ทดสอบการเชื่อมต่อฐานข้อมูล
  const dbConnected = await testConnection();

  if (!dbConnected) {
    console.error('❌ ไม่สามารถเชื่อมต่อฐานข้อมูลได้ กรุณาตรวจสอบการตั้งค่า');
    console.log('💡 ตรวจสอบไฟล์ .env และให้แน่ใจว่า MySQL กำลังทำงานอยู่');
    console.log('💡 รัน database/schema.sql เพื่อสร้างฐานข้อมูล');
    process.exit(1);
  }

  app.listen(PORT, () => {
    console.log(`
╔══════════════════════════════════════════════════╗
║  ระบบบริหารจัดการฝึกงานนักศึกษา - Backend API   ║
║──────────────────────────────────────────────────║
║  🚀 Server running on port ${PORT}                  ║
║  📦 Environment: ${process.env.NODE_ENV || 'development'}                  ║
║  🔗 API URL: http://localhost:${PORT}/api            ║
╚══════════════════════════════════════════════════╝
    `);
  });
}

startServer();
