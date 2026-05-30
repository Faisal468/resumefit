const jwt = require('jsonwebtoken');

const BLOG_ADMIN_EMAIL = 'blog@resumefit.com';
const BLOG_ADMIN_PASSWORD = 'blog1122';

const COOKIE_OPTS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: 24 * 60 * 60 * 1000, // 24 hours
};

const blogAdminLogin = (req, res) => {
  const { email, password } = req.body;
  if (email !== BLOG_ADMIN_EMAIL || password !== BLOG_ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Invalid blog admin credentials.' });
  }
  const token = jwt.sign({ role: 'blogAdmin' }, process.env.JWT_SECRET, { expiresIn: '24h' });
  res.cookie('blogAdminToken', token, COOKIE_OPTS);
  res.json({ ok: true });
};

const blogAdminLogout = (_req, res) => {
  res.clearCookie('blogAdminToken', { httpOnly: true, sameSite: 'lax' });
  res.json({ ok: true });
};

const requireBlogAdmin = (req, res, next) => {
  const token = req.cookies?.blogAdminToken;
  if (!token) return res.status(401).json({ error: 'Blog admin access required.' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== 'blogAdmin') throw new Error('Not blog admin');
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired admin session.' });
  }
};

module.exports = { blogAdminLogin, blogAdminLogout, requireBlogAdmin, COOKIE_OPTS };
