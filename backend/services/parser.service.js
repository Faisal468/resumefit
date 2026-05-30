const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const fs = require('fs');
const logger = require('../utils/logger');

/**
 * Extracts text and page count from a PDF or DOCX file.
 * Returns { text: string, pageCount: number }
 */
const parseResume = async (filePath, mimetype) => {
  const buffer = fs.readFileSync(filePath);
  let rawText = '';
  let pageCount = 1;

  if (mimetype === 'application/pdf') {
    const data = await pdfParse(buffer);
    rawText = data.text;
    pageCount = data.numpages || 1;
  } else if (
    mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    mimetype === 'application/msword'
  ) {
    const result = await mammoth.extractRawText({ buffer });
    rawText = result.value;
    // Estimate page count: ~400 words per page is standard for resumes
    const wordCount = rawText.split(/\s+/).filter(Boolean).length;
    pageCount = Math.max(1, Math.ceil(wordCount / 400));
  } else {
    throw new Error('Unsupported file type. Only PDF and DOCX are accepted.');
  }

  const text = cleanText(rawText);
  logger.info(`Parsed resume: ${text.length} chars, ${pageCount} page(s)`);
  return { text, pageCount };
};

/**
 * Normalizes whitespace, removes control characters, collapses blank lines.
 */
const cleanText = (text) => {
  return text
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/[^\S\n]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[^\x20-\x7E\n]/g, '')
    .trim();
};

module.exports = { parseResume, cleanText };
