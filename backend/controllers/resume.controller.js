const fs = require('fs');

const { parseResume } = require('../services/parser.service');
const { analyzeJD } = require('../services/jdAnalyzer.service');
const { calculateATSScore } = require('../services/ats.service');
const { analyzeGap } = require('../services/gap.service');
const { detectWeakBullets, rewriteResume, generateDiff } = require('../services/rewrite.service');
const { exportToDOCX, exportToPDF } = require('../services/export.service');
const { structureResume } = require('../services/resumeStructurer.service');
const { renderToPDF, renderToDOCX } = require('../services/templateRenderer.service');
const { getAll: getAllTemplates } = require('../services/templates');
const Resume = require('../models/Resume.model');
const logger = require('../utils/logger');

// ─── POST /api/resume/analyze ─────────────────────────────────────────────────

const analyzeResume = async (req, res) => {
  const file = req.file;
  const { jobDescription } = req.body;
  const userId = req.user.id;

  if (!file) {
    return res.status(400).json({ error: 'Resume file is required.' });
  }
  if (!jobDescription || jobDescription.trim().length < 50) {
    return res.status(400).json({ error: 'Job description must be at least 50 characters.' });
  }

  const record = await Resume.create({
    userId,
    originalFileName: file.originalname,
    originalResumeText: 'processing...',
    jobDescription: jobDescription.trim(),
    status: 'processing',
  });

  logger.info(`Starting analysis pipeline. Record ID: ${record._id}`);

  try {
    // ── Step 1: Parse resume (returns text + page count) ─────────────────────
    const { text: resumeText, pageCount } = await parseResume(file.path, file.mimetype);

    // ── Step 2: Analyze JD ───────────────────────────────────────────────────
    const jdAnalysis = await analyzeJD(jobDescription);

    // ── Step 3: ATS Score ────────────────────────────────────────────────────
    const { atsScore, breakdown: atsBreakdown } = calculateATSScore(resumeText, jdAnalysis);

    // ── Step 4: Gap Analysis ─────────────────────────────────────────────────
    const { jdMatchScore, missingSkills, missingKeywords, presentKeywords } = analyzeGap(
      resumeText,
      jdAnalysis
    );

    // ── Step 5: Detect weak bullets + rewrite (parallel) ─────────────────────
    const [weakBullets, optimizedResumeText] = await Promise.all([
      detectWeakBullets(resumeText),
      rewriteResume(resumeText, jobDescription, missingKeywords, missingSkills),
    ]);

    // ── Step 6: Generate diff ─────────────────────────────────────────────────
    const diffViewData = generateDiff(resumeText, optimizedResumeText);

    // ── Persist results ───────────────────────────────────────────────────────
    await Resume.findByIdAndUpdate(record._id, {
      originalResumeText: resumeText,
      originalPageCount: pageCount,
      atsScore,
      jdMatchScore,
      missingKeywords,
      missingSkills,
      presentKeywords,
      jdAnalysis,
      weakBullets,
      optimizedResumeText,
      diffViewData,
      status: 'completed',
    });

    fs.unlink(file.path, () => {});

    logger.info(`Analysis complete. Pages: ${pageCount}, ATS: ${atsScore}, Match: ${jdMatchScore}%`);

    res.json({
      id: record._id,
      originalPageCount: pageCount,
      atsScore,
      atsBreakdown,
      jdMatchScore,
      missingKeywords,
      missingSkills,
      presentKeywords,
      jdAnalysis,
      weakBullets,
      suggestedRewrites: weakBullets,
      finalOptimizedResume: optimizedResumeText,
      diffViewData,
    });
  } catch (error) {
    await Resume.findByIdAndUpdate(record._id, {
      status: 'failed',
      errorMessage: error.message,
    });
    if (file?.path) fs.unlink(file.path, () => {});
    throw error;
  }
};

// ─── GET /api/resume/:id ──────────────────────────────────────────────────────

const getResume = async (req, res) => {
  const resume = await Resume.findById(req.params.id).lean();
  if (!resume) return res.status(404).json({ error: 'Resume analysis not found.' });
  res.json(resume);
};

// ─── GET /api/resume/history ──────────────────────────────────────────────────

const getHistory = async (req, res) => {
  const { userId = 'anonymous', page = 1, limit = 10 } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [resumes, total] = await Promise.all([
    Resume.find({ userId, status: 'completed' })
      .select('originalFileName atsScore jdMatchScore createdAt jobDescription originalPageCount')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean(),
    Resume.countDocuments({ userId, status: 'completed' }),
  ]);

  res.json({ resumes, total, page: parseInt(page), limit: parseInt(limit) });
};

// ─── GET /api/resume/:id/export/pdf ──────────────────────────────────────────

const exportPDF = async (req, res) => {
  const resume = await Resume.findById(req.params.id).lean();
  if (!resume) return res.status(404).json({ error: 'Resume not found.' });

  const text = resume.optimizedResumeText || resume.originalResumeText;
  const targetPageCount = resume.originalPageCount || 1;

  logger.info(`PDF export requested. Target pages: ${targetPageCount}`);
  const pdfBuffer = await exportToPDF(text, targetPageCount);

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename="optimized-resume.pdf"');
  res.setHeader('Content-Length', pdfBuffer.length);
  res.send(pdfBuffer);
};

// ─── GET /api/resume/:id/export/docx ─────────────────────────────────────────

const exportDOCX = async (req, res) => {
  const resume = await Resume.findById(req.params.id).lean();
  if (!resume) return res.status(404).json({ error: 'Resume not found.' });

  const text = resume.optimizedResumeText || resume.originalResumeText;
  const targetPageCount = resume.originalPageCount || 1;

  logger.info(`DOCX export requested. Target pages: ${targetPageCount}`);
  const docxBuffer = await exportToDOCX(text, targetPageCount);

  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
  res.setHeader('Content-Disposition', 'attachment; filename="optimized-resume.docx"');
  res.setHeader('Content-Length', docxBuffer.length);
  res.send(docxBuffer);
};

// ─── PATCH /api/resume/:id/accept-change ─────────────────────────────────────

const acceptChange = async (req, res) => {
  const { bulletIndex, accepted } = req.body;
  if (typeof bulletIndex !== 'number' || typeof accepted !== 'boolean') {
    return res.status(400).json({ error: 'bulletIndex (number) and accepted (boolean) are required.' });
  }

  const resume = await Resume.findById(req.params.id);
  if (!resume) return res.status(404).json({ error: 'Resume not found.' });
  if (!resume.weakBullets[bulletIndex]) {
    return res.status(400).json({ error: 'Bullet index out of range.' });
  }

  resume.weakBullets[bulletIndex].accepted = accepted;
  await resume.save();
  res.json({ message: 'Change recorded.', bulletIndex, accepted });
};

// ─── GET /api/templates ───────────────────────────────────────────────────────

const listTemplates = (_req, res) => {
  res.json(getAllTemplates());
};

// ─── POST /api/resume/:id/render ─────────────────────────────────────────────
// Body: { templateId: string, format: 'pdf' | 'docx' }

const renderWithTemplate = async (req, res) => {
  const { templateId = 'modern', format = 'pdf' } = req.body;
  const resume = await Resume.findById(req.params.id).lean();
  if (!resume) return res.status(404).json({ error: 'Resume not found.' });

  const text = resume.optimizedResumeText || resume.originalResumeText;
  const targetPageCount = resume.originalPageCount || 1;

  // Use cached structuredData or parse fresh
  let structured = resume.structuredData;
  if (!structured) {
    logger.info(`Structuring resume for template render (id: ${resume._id})`);
    structured = await structureResume(text);
    await Resume.findByIdAndUpdate(resume._id, { structuredData: structured });
  }

  logger.info(`Rendering template="${templateId}" format="${format}" pages=${targetPageCount}`);

  if (format === 'docx') {
    const buf = await renderToDOCX(structured, templateId, targetPageCount);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Disposition', `attachment; filename="resume-${templateId}.docx"`);
    res.setHeader('Content-Length', buf.length);
    return res.send(buf);
  }

  const buf = await renderToPDF(structured, templateId, targetPageCount);
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="resume-${templateId}.pdf"`);
  res.setHeader('Content-Length', buf.length);
  res.send(buf);
};

// ─── DELETE /api/resume/:id ───────────────────────────────────────────────────

const deleteResume = async (req, res) => {
  const resume = await Resume.findByIdAndDelete(req.params.id);
  if (!resume) return res.status(404).json({ error: 'Resume not found.' });
  res.json({ message: 'Resume deleted.' });
};

module.exports = {
  analyzeResume,
  getResume,
  getHistory,
  exportPDF,
  exportDOCX,
  acceptChange,
  deleteResume,
  listTemplates,
  renderWithTemplate,
};
