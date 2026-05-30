const jwt = require('jsonwebtoken');

const protect = (req, res, next) => {
  const token = req.cookies?.token
    || req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ error: 'Not authenticated. Please log in.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: decoded.id, name: decoded.name, email: decoded.email };
    next();
  } catch {
    return res.status(401).json({ error: 'Session expired. Please log in again.' });
  }
};

module.exports = { protect };
