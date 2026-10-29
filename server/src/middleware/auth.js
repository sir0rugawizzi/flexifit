// server/src/middleware/auth.js
// JWT authentication & role-based route guard

import jwt from 'jsonwebtoken';
import config from '../config.js';

export function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required. No token provided.' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, config.JWT_SECRET);
    req.auth = decoded;

    // Fetch full fresh user from DB
    req.app.locals.db
      .getUserById(decoded.id)
      .then((user) => {
        if (!user) {
          return res.status(401).json({ error: 'User no longer exists.' });
        }
        req.user = user;
        next();
      })
      .catch((err) => {
        console.error('Auth middleware DB error:', err);
        res.status(500).json({ error: 'Authentication lookup failed.' });
      });
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired authentication token.' });
  }
}

export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required.' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: `Access denied. Requires one of the following roles: ${roles.join(', ')}`,
      });
    }
    next();
  };
}
