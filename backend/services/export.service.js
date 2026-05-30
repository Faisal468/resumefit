const { Document, Paragraph, TextRun, Packer } = require('docx');
const logger = require('../utils/logger');

// ─── DOCX Export ──────────────────────────────────────────────────────────────

/**
 * Converts plain resume text into an ATS-friendly DOCX buffer.
 * targetPageCount=1 uses tighter fonts/margins to stay on one page.
 */
const exportToDOCX = async (resumeText, targetPageCount = 1) => {
  logger.info(`Generating DOCX export (target: ${targetPageCount} page(s))...`);

  const isSinglePage = targetPageCount === 1;

  // Half-point font sizes: 20 = 10pt (compact), 22 = 11pt (standard)
  const fontSize  = isSinglePage ? 20 : 22;
  const headerSize = isSinglePage ? 22 : 24;

  // Twips: 720 = 0.5in, 576 = 0.4in
  const margin = isSinglePage ? 576 : 720;

  // Spacing in twentieths-of-a-point
  const sectionBefore = isSinglePage ? 120 : 200;
  const sectionAfter  = isSinglePage ? 60  : 100;
  const bulletAfter   = isSinglePage ? 40  : 80;
  const paraAfter     = isSinglePage ? 40  : 80;

  const lines = resumeText.split('\n').filter((l) => l.trim());
  const children = [];

  for (const line of lines) {
    const trimmed = line.trim();

    if (isSectionHeader(trimmed)) {
      children.push(
        new Paragraph({
          children: [new TextRun({ text: trimmed, bold: true, size: headerSize, color: '1e3a5f' })],
          spacing: { before: sectionBefore, after: sectionAfter },
          border: { bottom: { color: '2563EB', size: 6, style: 'single', space: 1 } },
        })
      );
    } else if (trimmed.startsWith('•') || trimmed.startsWith('-') || trimmed.startsWith('*')) {
      children.push(
        new Paragraph({
          text: trimmed.replace(/^[•\-*]\s*/, ''),
          bullet: { level: 0 },
          spacing: { after: bulletAfter },
          style: 'Normal',
        })
      );
    } else if (trimmed) {
      children.push(
        new Paragraph({
          children: [new TextRun({ text: trimmed, size: fontSize })],
          spacing: { after: paraAfter },
        })
      );
    }
  }

  const doc = new Document({
    sections: [{
      properties: {
        page: { margin: { top: margin, right: margin, bottom: margin, left: margin } },
      },
      children,
    }],
    styles: {
      default: {
        document: { run: { font: 'Calibri', size: fontSize } },
      },
    },
  });

  const buffer = await Packer.toBuffer(doc);
  logger.info('DOCX export complete');
  return buffer;
};

// ─── PDF Export (HTML → Puppeteer) ───────────────────────────────────────────

/**
 * Converts resume text to a styled PDF buffer.
 * targetPageCount=1 uses compact CSS + forces single-page output.
 */
const exportToPDF = async (resumeText, targetPageCount = 1) => {
  logger.info(`Generating PDF export (target: ${targetPageCount} page(s))...`);

  const puppeteer = require('puppeteer-core');
  const isSinglePage = targetPageCount === 1;

  const html = buildResumeHTML(resumeText, isSinglePage);
  const executablePath = getChromePath();

  const browser = await puppeteer.launch({
    executablePath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
  });

  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });

    const pdfOptions = {
      format: 'Letter',
      printBackground: true,
      margin: isSinglePage
        ? { top: '0.4in', right: '0.5in', bottom: '0.4in', left: '0.5in' }
        : { top: '0.75in', right: '0.75in', bottom: '0.75in', left: '0.75in' },
    };

    // Hard-enforce single page by restricting output to page 1 only
    if (isSinglePage) pdfOptions.pageRanges = '1';

    const pdfBuffer = await page.pdf(pdfOptions);
    logger.info('PDF export complete');
    return pdfBuffer;
  } finally {
    await browser.close();
  }
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const KNOWN_HEADERS = [
  'experience', 'education', 'skills', 'summary', 'objective',
  'projects', 'certifications', 'awards', 'publications', 'languages',
  'work experience', 'professional experience', 'technical skills',
  'work history', 'achievements', 'volunteer', 'interests', 'profile',
];

const isSectionHeader = (line) => {
  const lower = line.toLowerCase().trim();
  return (
    KNOWN_HEADERS.includes(lower) ||
    (line === line.toUpperCase() && line.length > 3 && line.length < 40)
  );
};

const getChromePath = () => {
  const candidates = {
    win32: [
      'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
      'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
      'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
    ],
    darwin: ['/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'],
    linux: ['/usr/bin/google-chrome', '/usr/bin/chromium-browser', '/usr/bin/chromium'],
  };

  const fs = require('fs');
  const list = candidates[process.platform] || candidates.linux;
  for (const p of list) {
    if (fs.existsSync(p)) return p;
  }
  throw new Error('Chrome/Edge not found. Install Google Chrome or set CHROME_PATH env variable.');
};

const buildResumeHTML = (resumeText, isSinglePage) => {
  // Compact styles for 1-page; standard styles otherwise
  const fontSize   = isSinglePage ? '9.5pt'  : '11pt';
  const lineHeight = isSinglePage ? '1.25'   : '1.4';
  const sectionGap = isSinglePage ? '10px'   : '14px';
  const paraGap    = isSinglePage ? '2px'    : '4px';
  const spacer     = isSinglePage ? '3px'    : '6px';

  const bodyHTML = resumeText
    .split('\n')
    .map((line) => {
      const t = line.trim();
      if (!t) return `<div class="spacer"></div>`;
      if (isSectionHeader(t)) return `<h2 class="section-header">${escapeHtml(t)}</h2>`;
      if (t.startsWith('•') || t.startsWith('-') || t.startsWith('*')) {
        return `<li>${escapeHtml(t.replace(/^[•\-*]\s*/, ''))}</li>`;
      }
      return `<p>${escapeHtml(t)}</p>`;
    })
    .join('\n');

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    font-family: 'Calibri', Arial, sans-serif;
    font-size: ${fontSize};
    color: #1a1a1a;
    line-height: ${lineHeight};
  }
  h2.section-header {
    font-size: calc(${fontSize} + 1pt);
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.4px;
    color: #1e3a5f;
    border-bottom: 1.5px solid #2563EB;
    padding-bottom: 2px;
    margin: ${sectionGap} 0 5px 0;
  }
  p { margin-bottom: ${paraGap}; }
  li { margin-left: 16px; margin-bottom: ${paraGap}; }
  .spacer { height: ${spacer}; }
</style>
</head>
<body>${bodyHTML}</body>
</html>`;
};

const escapeHtml = (str) =>
  str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

module.exports = { exportToDOCX, exportToPDF };
