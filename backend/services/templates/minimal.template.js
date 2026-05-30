/**
 * Minimal Template — Ultra-clean, generous whitespace, thin gray dividers, Helvetica/Arial.
 * Best for design, creative, and modern professional roles.
 */

const meta = {
  id: 'minimal',
  name: 'Minimal',
  description: 'Ultra-clean layout with generous whitespace. Lets your content breathe.',
  font: 'Arial',
  accentColor: '#9ca3af',
  previewColors: { bg: '#ffffff', header: '#111827', accent: '#9ca3af' },
};

const toHTML = (d, isSinglePage = false) => {
  const fs = isSinglePage ? '9.5pt' : '10.5pt';
  const lh = isSinglePage ? '1.3' : '1.5';
  const gap = isSinglePage ? '8px' : '14px';
  const entGap = isSinglePage ? '5px' : '10px';

  return `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>
  *{margin:0;padding:0;box-sizing:border-box}
  body{font-family:Arial,Helvetica,sans-serif;font-size:${fs};color:#111827;line-height:${lh};padding:${isSinglePage ? '18px 22px' : '28px 32px'}}
  .name{font-size:${isSinglePage ? '20pt' : '26pt'};font-weight:300;letter-spacing:2px;color:#111827;margin-bottom:4px}
  .role{font-size:${isSinglePage ? '9.5pt' : '11pt'};color:#6b7280;letter-spacing:0.5px;margin-bottom:6px}
  .contact{display:flex;flex-wrap:wrap;gap:${isSinglePage ? '8px' : '12px'};font-size:8.5pt;color:#6b7280;margin-bottom:${isSinglePage ? '12px' : '18px'}}
  .contact span{display:flex;align-items:center;gap:3px}
  hr{border:none;border-top:1px solid #e5e7eb;margin:${isSinglePage ? '6px 0' : '10px 0'}}
  .section{margin-bottom:${gap}}
  .section-title{font-size:8pt;font-weight:700;color:#9ca3af;text-transform:uppercase;letter-spacing:1.5px;margin-bottom:${isSinglePage ? '5px' : '8px'}}
  .entry{margin-bottom:${entGap}}
  .row{display:flex;justify-content:space-between;align-items:baseline;flex-wrap:wrap;gap:2px}
  .entry-title{font-weight:600;color:#111827;font-size:${isSinglePage ? '9.5pt' : '10.5pt'}}
  .entry-sub{color:#6b7280;font-size:9pt}
  .entry-date{font-size:8.5pt;color:#9ca3af;white-space:nowrap}
  ul{padding-left:14px;margin-top:3px}
  li{margin-bottom:2px;color:#374151;font-size:${fs}}
  .skills-wrap{display:flex;flex-wrap:wrap;gap:${isSinglePage ? '3px' : '5px'}}
  .sk{font-size:8.5pt;color:#4b5563;background:#f9fafb;border:1px solid #e5e7eb;padding:1px 8px;border-radius:2px}
  .summary{color:#4b5563;font-size:${fs}}
  </style></head><body>

  <div class="name">${esc(d.personalInfo.name)}</div>
  ${d.experience?.[0]?.title ? `<div class="role">${esc(d.experience[0].title)}</div>` : ''}
  <div class="contact">
    ${[d.personalInfo.email, d.personalInfo.phone, d.personalInfo.location,
       d.personalInfo.linkedin, d.personalInfo.github, d.personalInfo.website]
      .filter(Boolean).map(v => `<span>${esc(v)}</span>`).join('')}
  </div>
  <hr/>

  ${d.summary ? `
  <div class="section">
    <div class="section-title">Summary</div>
    <div class="summary">${esc(d.summary)}</div>
  </div>` : ''}

  ${d.experience?.length ? `
  <div class="section">
    <div class="section-title">Experience</div>
    ${d.experience.map(e => `
    <div class="entry">
      <div class="row">
        <div><span class="entry-title">${esc(e.title)}</span>${e.company ? `<span class="entry-sub"> — ${esc(e.company)}</span>` : ''}</div>
        <div class="entry-date">${esc(e.startDate)}${e.endDate ? ` – ${esc(e.endDate)}` : ''}${e.location ? ` · ${esc(e.location)}` : ''}</div>
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
        <div><span class="entry-title">${esc(e.degree)}</span>${e.school ? `<span class="entry-sub"> — ${esc(e.school)}</span>` : ''}</div>
        <div class="entry-date">${esc(e.graduationYear || '')}${e.location ? ` · ${esc(e.location)}` : ''}</div>
      </div>
      ${e.gpa ? `<div class="entry-sub">GPA: ${esc(e.gpa)}</div>` : ''}
    </div>`).join('')}
  </div>` : ''}

  ${d.skills?.length ? `
  <div class="section">
    <div class="section-title">Skills</div>
    <div class="skills-wrap">
      ${d.skills.map(s => `<span class="sk">${esc(s)}</span>`).join('')}
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
      ${p.description ? `<div class="summary" style="margin-top:2px">${esc(p.description)}</div>` : ''}
      ${p.technologies?.length ? `<div class="entry-sub" style="margin-top:2px">${p.technologies.map(esc).join(' · ')}</div>` : ''}
    </div>`).join('')}
  </div>` : ''}

  ${d.certifications?.length ? `
  <div class="section">
    <div class="section-title">Certifications</div>
    <ul>${d.certifications.map(c => `<li>${esc(c)}</li>`).join('')}</ul>
  </div>` : ''}

  </body></html>`;
};

const esc = (s) => String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');

module.exports = { meta, toHTML };
