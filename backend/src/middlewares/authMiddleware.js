const jwt = require('jsonwebtoken');

const protect = (req, res, next) => {
  let token = null;

  // 1. Check HTTP-only cookie first
  if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }
  // 2. Fallback to Authorization header
  else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      error: 'Authentication required. Invalid or missing token.'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev_secret_key');
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      error: 'Authentication required. Invalid or expired token.'
    });
  }
};

const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'ADMIN') {
    return res.status(403).json({
      error: 'Access denied. Administrator privileges required.'
    });
  }
  next();
};

const requireMarriageAccess = (paramKey = 'marriageId') => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required.' });
    }

    // Admins have broad access
    if (req.user.role === 'ADMIN') {
      return next();
    }

    // Guests must match the specific marriage
    const targetMarriageId = req.params[paramKey] || req.body[paramKey];
    if (req.user.role === 'GUEST' && req.user.assignedMarriageId === targetMarriageId) {
      return next();
    }

    return res.status(403).json({
      error: 'You do not have permission to access this marriage dashboard.'
    });
  };
};

module.exports = {
  protect,
  requireAdmin,
  requireMarriageAccess
};

