const express = require('express');
const { blogAdminLogin, blogAdminLogout, requireBlogAdmin } = require('../middleware/blogAdmin');
const {
  listPosts, getPost,
  adminListPosts, createPost, updatePost, deletePost,
} = require('../controllers/blog.controller');

const router = express.Router();

// ── Public ────────────────────────────────────────────────────────────────────
router.get('/posts', listPosts);
router.get('/posts/:slug', getPost);

// ── Admin auth ────────────────────────────────────────────────────────────────
router.post('/admin/login', blogAdminLogin);
router.post('/admin/logout', blogAdminLogout);

// ── Admin CRUD ────────────────────────────────────────────────────────────────
router.get('/admin/posts', requireBlogAdmin, adminListPosts);
router.post('/admin/posts', requireBlogAdmin, createPost);
router.put('/admin/posts/:id', requireBlogAdmin, updatePost);
router.delete('/admin/posts/:id', requireBlogAdmin, deletePost);

module.exports = router;
