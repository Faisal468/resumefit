const puppeteer = require('puppeteer-core');
const fs = require('fs');
const { Document, Paragraph, TextRun, Packer, AlignmentType, BorderStyle } = require('docx');
const { getById } = require('./templates');

const getChromePath = () => {
  if (process.env.CHROME_PATH && fs.existsSync(process.env.CHROME_PATH)) {
    return process.env.CHROME_PATH;
  }
  const candidates = {
    win32: [
      'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
      'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
      'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
    ],
    darwin: ['/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'],
    linux: ['/usr/bin/google-chrome', '/usr/bin/chromium-browser', '/usr/bin/chromium'],
  };
  const list = candidates[process.platform] || candidates.linux;
  for (const p of list) {
    if (fs.existsSync(p)) return p;
  }
  throw new Error('Chrome/Edge not found. Install Google Chrome or set CHROME_PATH in .env');
};

const launchBrowser = async () => {
  return puppeteer.launch({
    executablePath: getChromePath(),
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
  });
};

const renderToPDF = async (structuredData, templateId, targetPageCount = 1) => {
  const template = getById(templateId);
  if (!template) throw new Error(`Template "${templateId}" not found`);

  const isSinglePage = targetPageCount === 1;
  const html = template.toHTML(structuredData, isSinglePage);

  const browser = await launchBrowser();
  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });

    const pdfOptions = {
      format: 'Letter',
      printBackground: true,
      margin: isSinglePage
        ? { top: '0.4in', right: '0.45in', bottom: '0.4in', left: '0.45in' }
        : { top: '0.7in', right: '0.7in', bottom: '0.7in', left: '0.7in' },
    };
    if (isSinglePage) pdfOptions.pageRanges = '1';

    return await page.pdf(pdfOptions);
  } finally {
    await browser.close();
  }
};

// Converts structured resume data to a DOCX with template-inspired styling
const renderToDOCX = async (structuredData, templateId, targetPageCount = 1) => {
  const template = getById(templateId);
  if (!template) throw new Error(`Template "${templateId}" not found`);

  const isSinglePage = targetPageCount === 1;
  const fontSize = isSinglePage ? 18 : 20; // half-points
  const margin = isSinglePage ? 576 : 720; // twips (576=0.4in, 720=0.5in)
  const { accentColor } = template.meta;
  const accent = accentColor.replace('#', '');

  const d = structuredData;
  const children = [];

  const hr = () => new Paragraph({
    border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: accent } },
    spacing: { after: 60 },
  });

  const sectionHeading = (text) => new Paragraph({
    children: [new TextRun({ text: text.toUpperCase(), bold: true, size: fontSize + 2, color: accent })],
    spacing: { before: 120, after: 60 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: accent } },
  });

  // Header
  children.push(new Paragraph({
    children: [new TextRun({ text: d.personalInfo.name || '', bold: true, size: fontSize + 12, color: '1e3a5f' })],
    alignment: AlignmentType.CENTER,
    spacing: { after: 40 },
  }));

  const contactParts = [
    d.personalInfo.email, d.personalInfo.phone, d.personalInfo.location,
    d.personalInfo.linkedin, d.personalInfo.github, d.personalInfo.website,
  ].filter(Boolean);

  if (contactParts.length) {
    children.push(new Paragraph({
      children: contactParts.map((v, i) => [
        new TextRun({ text: v, size: fontSize - 2, color: '4b5563' }),
        ...(i < contactParts.length - 1 ? [new TextRun({ text: '  |  ', size: fontSize - 2, color: '9ca3af' })] : []),
      ]).flat(),
      alignment: AlignmentType.CENTER,
      spacing: { after: 80 },
    }));
  }
  children.push(hr());

  // Summary
  if (d.summary) {
    children.push(sectionHeading('Summary'));
    children.push(new Paragraph({
      children: [new TextRun({ text: d.summary, size: fontSize, color: '374151' })],
      spacing: { after: 80 },
    }));
  }

  // Experience
  if (d.experience?.length) {
    children.push(sectionHeading('Experience'));
    d.experience.forEach(e => {
      const titleParts = [new TextRun({ text: e.title || '', bold: true, size: fontSize, color: '1e3a5f' })];
      if (e.company) titleParts.push(new TextRun({ text: `  ·  ${e.company}`, size: fontSize, color: '4b5563' }));
      children.push(new Paragraph({ children: titleParts, spacing: { before: 80, after: 20 } }));

      const dateParts = [e.startDate, e.endDate].filter(Boolean).join(' – ');
      const loc = e.location ? ` | ${e.location}` : '';
      if (dateParts || loc) {
        children.push(new Paragraph({
          children: [new TextRun({ text: dateParts + loc, size: fontSize - 2, color: '6b7280', italics: true })],
          spacing: { after: 20 },
        }));
      }

      (e.bullets || []).forEach(b => {
        children.push(new Paragraph({
          children: [new TextRun({ text: b, size: fontSize, color: '374151' })],
          bullet: { level: 0 },
          spacing: { after: 20 },
        }));
      });
    });
  }

  // Education
  if (d.education?.length) {
    children.push(sectionHeading('Education'));
    d.education.forEach(e => {
      const titleParts = [new TextRun({ text: e.degree || '', bold: true, size: fontSize, color: '1e3a5f' })];
      if (e.school) titleParts.push(new TextRun({ text: `  ·  ${e.school}`, size: fontSize, color: '4b5563' }));
      children.push(new Paragraph({ children: titleParts, spacing: { before: 80, after: 20 } }));
      if (e.graduationYear || e.location) {
        children.push(new Paragraph({
          children: [new TextRun({ text: [e.graduationYear, e.location].filter(Boolean).join(' | '), size: fontSize - 2, color: '6b7280', italics: true })],
          spacing: { after: 20 },
        }));
      }
      if (e.gpa) {
        children.push(new Paragraph({
          children: [new TextRun({ text: `GPA: ${e.gpa}`, size: fontSize - 2, color: '4b5563' })],
          spacing: { after: 20 },
        }));
      }
    });
  }

  // Skills
  if (d.skills?.length) {
    children.push(sectionHeading('Skills'));
    children.push(new Paragraph({
      children: [new TextRun({ text: d.skills.join('  ·  '), size: fontSize, color: '374151' })],
      spacing: { after: 80 },
    }));
  }

  // Projects
  if (d.projects?.length) {
    children.push(sectionHeading('Projects'));
    d.projects.forEach(p => {
      children.push(new Paragraph({
        children: [
          new TextRun({ text: p.name || '', bold: true, size: fontSize, color: '1e3a5f' }),
          ...(p.link ? [new TextRun({ text: `  ${p.link}`, size: fontSize - 2, color: '6b7280', italics: true })] : []),
        ],
        spacing: { before: 80, after: 20 },
      }));
      if (p.description) {
        children.push(new Paragraph({
          children: [new TextRun({ text: p.description, size: fontSize, color: '374151' })],
          spacing: { after: 20 },
        }));
      }
      if (p.technologies?.length) {
        children.push(new Paragraph({
          children: [new TextRun({ text: p.technologies.join(' · '), size: fontSize - 2, color: '4b5563', italics: true })],
          spacing: { after: 20 },
        }));
      }
    });
  }

  // Certifications
  if (d.certifications?.length) {
    children.push(sectionHeading('Certifications'));
    d.certifications.forEach(c => {
      children.push(new Paragraph({
        children: [new TextRun({ text: c, size: fontSize, color: '374151' })],
        bullet: { level: 0 },
        spacing: { after: 20 },
      }));
    });
  }

  const doc = new Document({
    sections: [{
      properties: {
        page: {
          margin: { top: margin, right: margin, bottom: margin, left: margin },
        },
      },
      children,
    }],
  });

  return Packer.toBuffer(doc);
};

module.exports = { renderToPDF, renderToDOCX };
