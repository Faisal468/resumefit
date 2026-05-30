/**
 * Modern Template — Blue accent bar on sections, Calibri font, clean hierarchy.
 * Great for tech, product, and startup roles.
 */

const meta = {
  id: 'modern',
  name: 'Modern',
  description: 'Clean blue accents with strong typographic hierarchy. Perfect for tech roles.',
  font: 'Calibri',
  accentColor: '#2563EB',
  previewColors: { bg: '#f8faff', header: '#1e3a5f', accent: '#2563EB' },
};

const toHTML = (d, isSinglePage = false) => {
  const fs = isSinglePage ? '9.5pt' : '10.5pt';
  const lh = isSinglePage ? '1.25' : '1.4';
  const gap = isSinglePage ? '8px' : '13px';
  const entGap = isSinglePage ? '5px' : '9px';

  return `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>
  *{margin:0;padding:0;box-sizing:border-box}
  body{font-family:Calibri,Arial,sans-serif;font-size:${fs};color:#1a1a1a;line-height:${lh}}
  .header{background:#1e3a5f;color:#fff;padding:${isSinglePage ? '10px 14px' : '14px 18px'};margin-bottom:${gap}}
  .name{font-size:${isSinglePage ? '18pt' : '22pt'};font-weight:700;letter-spacing:0.3px}
  .role{font-size:${isSinglePage ? '10pt' : '11pt'};opacity:0.85;margin-top:2px}
  .contact{display:flex;flex-wrap:wrap;gap:8px;margin-top:5px;font-size:9pt;opacity:0.9}
  .section{margin-bottom:${gap}}
  .section-title{font-size:${isSinglePage ? '10pt' : '11pt'};font-weight:700;color:#2563EB;text-transform:uppercase;letter-spacing:0.8px;border-bottom:2px solid #2563EB;padding-bottom:2px;margin-bottom:5px}
  .entry{margin-bottom:${entGap};padding-left:8px;border-left:3px solid #e5e7eb}
  .row{display:flex;justify-content:space-between;align-items:baseline;flex-wrap:wrap;gap:2px}
  .entry-title{font-weight:700;color:#1e3a5f}
  .entry-sub{color:#4b5563;font-size:9.5pt}
  .entry-date{font-size:9pt;color:#6b7280;white-space:nowrap}
  ul{padding-left:16px;margin-top:3px}
  li{margin-bottom:2px;color:#374151}
  .skills-grid{display:flex;flex-wrap:wrap;gap:4px}
  .skill-tag{background:#eff6ff;color:#1d4ed8;border:1px solid #bfdbfe;padding:1px 7px;border-radius:12px;font-size:9pt}
  .summary{color:#374151;font-size:${fs}}
  </style></head><body>
  <div class="header">
    <div class="name">${esc(d.personalInfo.name)}</div>
    ${d.experience?.[0]?.title ? `<div class="role">${esc(d.experience[0].title)}</div>` : ''}
    <div class="contact">
      ${[d.personalInfo.email, d.personalInfo.phone, d.personalInfo.location,
         d.personalInfo.linkedin, d.personalInfo.github, d.personalInfo.website]
        .filter(Boolean).map(v => `<span>◈ ${esc(v)}</span>`).join('')}
    </div>
  </div>

  <div style="padding: 0 ${isSinglePage ? '10px' : '14px'}">
  ${d.summary ? `
  <div class="section">
    <div class="section-title">Professional Summary</div>
    <div class="summary">${esc(d.summary)}</div>
  </div>` : ''}

  ${d.experience?.length ? `
  <div class="section">
    <div class="section-title">Experience</div>
    ${d.experience.map(e => `
    <div class="entry">
      <div class="row">
        <div><span class="entry-title">${esc(e.title)}</span>${e.company ? ` · <span class="entry-sub">${esc(e.company)}</span>` : ''}</div>
        <div class="entry-date">${esc(e.startDate)}${e.endDate ? ` – ${esc(e.endDate)}` : ''}${e.location ? ` | ${esc(e.location)}` : ''}</div>
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
        <div><span class="entry-title">${esc(e.degree)}</span>${e.school ? ` · <span class="entry-sub">${esc(e.school)}</span>` : ''}</div>
        <div class="entry-date">${esc(e.graduationYear || '')}${e.location ? ` | ${esc(e.location)}` : ''}</div>
      </div>
      ${e.gpa ? `<div class="entry-sub">GPA: ${esc(e.gpa)}</div>` : ''}
    </div>`).join('')}
  </div>` : ''}

  ${d.skills?.length ? `
  <div class="section">
    <div class="section-title">Skills</div>
    <div class="skills-grid">
      ${d.skills.map(s => `<span class="skill-tag">${esc(s)}</span>`).join('')}
    </div>
  </div>` : ''}

  ${d.projects?.length ? `
  <div class="section">
    <div class="section-title">Projects</div>
    ${d.projects.map(p => `
    <div class="entry">
      <div class="row">
        <span class="entry-title">${esc(p.name)}</span>
        ${p.link ? `<span class="entry-date">${esc(p.link)}</span>` : ''}
      </div>
      ${p.description ? `<div>${esc(p.description)}</div>` : ''}
      ${p.technologies?.length ? `<div class="entry-sub">${p.technologies.map(esc).join(' · ')}</div>` : ''}
    </div>`).join('')}
  </div>` : ''}

  ${d.certifications?.length ? `
  <div class="section">
    <div class="section-title">Certifications</div>
    <ul>${d.certifications.map(c => `<li>${esc(c)}</li>`).join('')}</ul>
  </div>` : ''}
  </div>
  </body></html>`;
};

const esc = (s) => String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');

module.exports = { meta, toHTML };
