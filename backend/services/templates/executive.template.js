/**
 * Executive Template — Georgia serif headers, navy/gold accents, authoritative layout.
 * Designed for C-suite, VP, and senior leadership roles.
 */

const meta = {
  id: 'executive',
  name: 'Executive',
  description: 'Bold serif headers with navy accents. Commands attention for senior roles.',
  font: 'Georgia',
  accentColor: '#1e3a5f',
  previewColors: { bg: '#fafaf8', header: '#1e3a5f', accent: '#b8860b' },
};

const toHTML = (d, isSinglePage = false) => {
  const fs = isSinglePage ? '10pt' : '11pt';
  const lh = isSinglePage ? '1.3' : '1.45';
  const gap = isSinglePage ? '7px' : '12px';
  const entGap = isSinglePage ? '5px' : '9px';

  return `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>
  *{margin:0;padding:0;box-sizing:border-box}
  body{font-family:Georgia,'Times New Roman',serif;font-size:${fs};color:#1a1a1a;line-height:${lh};background:#fafaf8}
  .header{text-align:center;padding:${isSinglePage ? '14px 20px 10px' : '22px 28px 14px'};border-bottom:3px solid #1e3a5f;margin-bottom:${gap}}
  .name{font-size:${isSinglePage ? '20pt' : '26pt'};font-weight:700;color:#1e3a5f;letter-spacing:1px;font-variant:small-caps}
  .role{font-size:${isSinglePage ? '10pt' : '11.5pt'};color:#b8860b;font-style:italic;margin-top:3px;letter-spacing:0.3px}
  .contact{display:flex;justify-content:center;flex-wrap:wrap;gap:6px 14px;margin-top:6px;font-size:9pt;color:#4b5563}
  .contact-sep{color:#b8860b;margin:0 2px}
  .section{margin-bottom:${gap}}
  .section-title{font-size:${isSinglePage ? '10pt' : '11pt'};font-weight:700;color:#1e3a5f;font-variant:small-caps;letter-spacing:1px;border-bottom:2px solid #1e3a5f;padding-bottom:2px;margin-bottom:${isSinglePage ? '5px' : '8px'};position:relative}
  .section-title::after{content:'';display:block;width:40px;height:2px;background:#b8860b;position:absolute;bottom:-2px;left:0}
  .entry{margin-bottom:${entGap}}
  .row{display:flex;justify-content:space-between;align-items:baseline;flex-wrap:wrap;gap:2px}
  .entry-title{font-weight:700;color:#1e3a5f;font-size:${isSinglePage ? '10pt' : '10.5pt'}}
  .entry-sub{color:#6b7280;font-style:italic;font-size:9.5pt}
  .entry-date{font-size:9pt;color:#6b7280;white-space:nowrap;font-style:italic}
  ul{padding-left:16px;margin-top:3px}
  li{margin-bottom:2px;color:#374151}
  li::marker{color:#b8860b}
  .skills-grid{display:flex;flex-wrap:wrap;gap:4px}
  .sk{font-size:9pt;color:#1e3a5f;background:#eef2f7;border:1px solid #c8d6e8;padding:1px 9px;border-radius:2px;font-style:italic}
  .summary{color:#374151;font-size:${fs};font-style:italic;border-left:3px solid #b8860b;padding-left:10px}
  .pad{padding:0 ${isSinglePage ? '14px' : '20px'}}
  </style></head><body>

  <div class="header">
    <div class="name">${esc(d.personalInfo.name)}</div>
    ${d.experience?.[0]?.title ? `<div class="role">${esc(d.experience[0].title)}</div>` : ''}
    <div class="contact">
      ${[d.personalInfo.email, d.personalInfo.phone, d.personalInfo.location,
         d.personalInfo.linkedin, d.personalInfo.github, d.personalInfo.website]
        .filter(Boolean)
        .map((v, i, arr) => `<span>${esc(v)}</span>${i < arr.length - 1 ? '<span class="contact-sep">◆</span>' : ''}`)
        .join('')}
    </div>
  </div>

  <div class="pad">
  ${d.summary ? `
  <div class="section">
    <div class="section-title">Executive Profile</div>
    <div class="summary">${esc(d.summary)}</div>
  </div>` : ''}

  ${d.experience?.length ? `
  <div class="section">
    <div class="section-title">Professional Experience</div>
    ${d.experience.map(e => `
    <div class="entry">
      <div class="row">
        <div>
          <span class="entry-title">${esc(e.title)}</span>
          ${e.company ? `<span class="entry-sub"> · ${esc(e.company)}</span>` : ''}
          ${e.location ? `<span class="entry-sub"> · ${esc(e.location)}</span>` : ''}
        </div>
        <div class="entry-date">${esc(e.startDate)}${e.endDate ? ` – ${esc(e.endDate)}` : ''}</div>
      </div>
      ${e.bullets?.length ? `<ul>${e.bullets.map(b => `<li>${esc(b)}</li>`).join('')}</ul>` : ''}
    </div>`).join('')}
  </div>` : ''}

  ${d.education?.length ? `
  <div class="section">
    <div class="section-title">Education</div>
    ${d.education.map(e => `
    <div class="entry">
      <div class="row">
        <div>
          <span class="entry-title">${esc(e.degree)}</span>
          ${e.school ? `<span class="entry-sub"> · ${esc(e.school)}</span>` : ''}
          ${e.location ? `<span class="entry-sub"> · ${esc(e.location)}</span>` : ''}
        </div>
        <div class="entry-date">${esc(e.graduationYear || '')}</div>
      </div>
      ${e.gpa ? `<div class="entry-sub">GPA: ${esc(e.gpa)}</div>` : ''}
    </div>`).join('')}
  </div>` : ''}

  ${d.skills?.length ? `
  <div class="section">
    <div class="section-title">Core Competencies</div>
    <div class="skills-grid">
      ${d.skills.map(s => `<span class="sk">${esc(s)}</span>`).join('')}
    </div>
  </div>` : ''}

  ${d.projects?.length ? `
  <div class="section">
    <div class="section-title">Key Initiatives</div>
    ${d.projects.map(p => `
    <div class="entry">
      <div class="row">
        <span class="entry-title">${esc(p.name)}</span>
        ${p.link ? `<span class="entry-date">${esc(p.link)}</span>` : ''}
      </div>
      ${p.description ? `<div style="margin-top:2px;color:#374151">${esc(p.description)}</div>` : ''}
      ${p.technologies?.length ? `<div class="entry-sub" style="margin-top:2px">${p.technologies.map(esc).join(' · ')}</div>` : ''}
    </div>`).join('')}
  </div>` : ''}

  ${d.certifications?.length ? `
  <div class="section">
    <div class="section-title">Certifications & Credentials</div>
    <ul>${d.certifications.map(c => `<li>${esc(c)}</li>`).join('')}</ul>
  </div>` : ''}
  </div>

  </body></html>`;
};

const esc = (s) => String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');

module.exports = { meta, toHTML };
