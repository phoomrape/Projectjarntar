const express = require('express');
const cors = require('cors');
require('dotenv').config();

const errorHandler = require('./middleware/errorHandler');

// Import Routes
const authRoutes = require('./routes/authRoutes');
const studentRoutes = require('./routes/studentRoutes');
const alumniRoutes = require('./routes/alumniRoutes');
const advisorRoutes = require('./routes/advisorRoutes');
const projectRoutes = require('./routes/projectRoutes');

const app = express();

// =============================================
// Middleware
// =============================================
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// =============================================
// Routes
// =============================================
app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: 'ระบบบริหารจัดการฝึกงานนักศึกษา API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      students: '/api/students',
      alumni: '/api/alumni',
      advisors: '/api/advisors',
      projects: '/api/projects',
    },
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/alumni', alumniRoutes);
app.use('/api/advisors', advisorRoutes);
app.use('/api/projects', projectRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'ไม่พบเส้นทางที่ร้องขอ' });
});

// Global Error Handler
app.use(errorHandler);

module.exports = app;
