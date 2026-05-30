const express = require('express');
const upload = require('../middleware/upload');
const { protect } = require('../middleware/auth');
const {
  analyzeResume,
  getResume,
  getHistory,
  exportPDF,
  exportDOCX,
  acceptChange,
  deleteResume,
  listTemplates,
  renderWithTemplate,
} = require('../controllers/resume.controller');

const router = express.Router();

// All resume routes require authentication
router.use(protect);

// POST /api/resume/analyze — main pipeline
router.post('/analyze', upload.single('resume'), analyzeResume);

// GET /api/resume/history — paginated history
router.get('/history', getHistory);

// GET /api/templates — list all available templates
router.get('/templates', listTemplates);

// GET /api/resume/:id — fetch single analysis
router.get('/:id', getResume);

// PATCH /api/resume/:id/accept-change — accept/reject bullet rewrite
router.patch('/:id/accept-change', acceptChange);

// GET /api/resume/:id/export/pdf
router.get('/:id/export/pdf', exportPDF);

// GET /api/resume/:id/export/docx
router.get('/:id/export/docx', exportDOCX);

// POST /api/resume/:id/render — template-based render
router.post('/:id/render', renderWithTemplate);

// DELETE /api/resume/:id
router.delete('/:id', deleteResume);

module.exports = router;
