const jwt = require('jsonwebtoken');

// Middleware ตรวจสอบ JWT Token
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ success: false, message: 'ไม่พบ Token กรุณาเข้าสู่ระบบ' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ success: false, message: 'Token ไม่ถูกต้องหรือหมดอายุ' });
  }
}

// Middleware ตรวจสอบบทบาท
function authorizeRoles(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'คุณไม่มีสิทธิ์เข้าถึงส่วนนี้',
      });
    }
    next();
  };
}

module.exports = { authenticateToken, authorizeRoles };
