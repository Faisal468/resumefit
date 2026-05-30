/**
 * Compact Template — Arial 9pt, two-column sidebar layout, maximizes content density.
 * Best when you need to fit a lot of experience on one page.
 */

const meta = {
  id: 'compact',
  name: 'Compact',
  description: 'Two-column sidebar layout. Fits maximum content while staying ATS-safe.',
  font: 'Arial',
  accentColor: '#059669',
  previewColors: { bg: '#f0fdf4', header: '#065f46', accent: '#059669' },
};

const toHTML = (d, isSinglePage = false) => {
  const fs = isSinglePage ? '8.5pt' : '9.5pt';
  const lh = isSinglePage ? '1.25' : '1.35';
  const gap = isSinglePage ? '6px' : '10px';
  const entGap = isSinglePage ? '4px' : '7px';

  return `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>
  *{margin:0;padding:0;box-sizing:border-box}
  body{font-family:Arial,Helvetica,sans-serif;font-size:${fs};color:#1a1a1a;line-height:${lh}}
  .header{background:#065f46;color:#fff;padding:${isSinglePage ? '8px 12px' : '12px 16px'};margin-bottom:0}
  .name{font-size:${isSinglePage ? '16pt' : '20pt'};font-weight:700;letter-spacing:0.5px}
  .role{font-size:${isSinglePage ? '8.5pt' : '9.5pt'};opacity:0.85;margin-top:1px}
  .contact{display:flex;flex-wrap:wrap;gap:6px;margin-top:4px;font-size:8pt;opacity:0.9}
  .layout{display:flex;gap:0}
  .sidebar{width:${isSinglePage ? '34%' : '32%'};background:#f0fdf4;padding:${isSinglePage ? '8px' : '12px'};border-right:2px solid #d1fae5;flex-shrink:0}
  .main{flex:1;padding:${isSinglePage ? '8px 10px' : '12px 14px'}}
  .section{margin-bottom:${gap}}
  .section-title{font-size:${isSinglePage ? '7.5pt' : '8.5pt'};font-weight:700;color:#065f46;text-transform:uppercase;letter-spacing:1px;border-bottom:1.5px solid #059669;padding-bottom:1px;margin-bottom:4px}
  .entry{margin-bottom:${entGap}}
  .row{display:flex;justify-content:space-between;align-items:baseline;flex-wrap:wrap;gap:1px}
  .entry-title{font-weight:700;color:#065f46;font-size:${isSinglePage ? '8.5pt' : '9.5pt'}}
  .entry-sub{color:#4b5563;font-size:${isSinglePage ? '8pt' : '8.5pt'}}
  .entry-date{font-size:${isSinglePage ? '7.5pt' : '8pt'};color:#6b7280;white-space:nowrap}
  ul{padding-left:12px;margin-top:2px}
  li{margin-bottom:1px;color:#374151;font-size:${fs}}
  .skill-item{font-size:${isSinglePage ? '8pt' : '8.5pt'};color:#065f46;padding:1px 0;border-bottom:1px dotted #a7f3d0;margin-bottom:2px}
  .skill-item:last-child{border-bottom:none}
  .sk-dot{color:#059669;margin-right:3px}
  .summary{color:#374151;font-size:${fs}}
  .cert-item{font-size:${isSinglePage ? '8pt' : '8.5pt'};color:#374151;margin-bottom:2px;padding-left:8px;position:relative}
  .cert-item::before{content:'✓';position:absolute;left:0;color:#059669;font-size:7pt}
  </style></head><body>

  <div class="header">
    <div class="name">${esc(d.personalInfo.name)}</div>
    ${d.experience?.[0]?.title ? `<div class="role">${esc(d.experience[0].title)}</div>` : ''}
    <div class="contact">
      ${[d.personalInfo.email, d.personalInfo.phone, d.personalInfo.location,
         d.personalInfo.linkedin, d.personalInfo.github, d.personalInfo.website]
        .filter(Boolean).map(v => `<span>• ${esc(v)}</span>`).join('')}
    </div>
  </div>

  <div class="layout">
    <!-- Sidebar -->
    <div class="sidebar">
      ${d.skills?.length ? `
      <div class="section">
        <div class="section-title">Skills</div>
        ${d.skills.map(s => `<div class="skill-item"><span class="sk-dot">›</span>${esc(s)}</div>`).join('')}
      </div>` : ''}

      ${d.education?.length ? `
      <div class="section">
        <div class="section-title">Education</div>
        ${d.education.map(e => `
        <div class="entry">
          <div class="entry-title">${esc(e.degree)}</div>
          ${e.school ? `<div class="entry-sub">${esc(e.school)}</div>` : ''}
          ${e.location ? `<div class="entry-sub">${esc(e.location)}</div>` : ''}
          <div class="entry-date">${esc(e.graduationYear || '')}</div>
          ${e.gpa ? `<div class="entry-sub">GPA: ${esc(e.gpa)}</div>` : ''}
        </div>`).join('')}
      </div>` : ''}

      ${d.certifications?.length ? `
      <div class="section">
        <div class="section-title">Certifications</div>
        ${d.certifications.map(c => `<div class="cert-item">${esc(c)}</div>`).join('')}
      </div>` : ''}

      ${d.projects?.length ? `
      <div class="section">
        <div class="section-title">Projects</div>
        ${d.projects.map(p => `
        <div class="entry">
          <div class="entry-title">${esc(p.name)}</div>
          ${p.description ? `<div style="font-size:${isSinglePage ? '7.5pt' : '8pt'};color:#4b5563;margin-top:1px">${esc(p.description)}</div>` : ''}
          ${p.technologies?.length ? `<div class="entry-sub" style="margin-top:1px">${p.technologies.map(esc).join(' · ')}</div>` : ''}
          ${p.link ? `<div style="font-size:7.5pt;color:#059669;word-break:break-all">${esc(p.link)}</div>` : ''}
        </div>`).join('')}
      </div>` : ''}
    </div>

    <!-- Main content -->
    <div class="main">
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
            <div>
              <span class="entry-title">${esc(e.title)}</span>
              ${e.company ? `<span class="entry-sub"> · ${esc(e.company)}</span>` : ''}
            </div>
            <div class="entry-date">${esc(e.startDate)}${e.endDate ? ` – ${esc(e.endDate)}` : ''}${e.location ? ` | ${esc(e.location)}` : ''}</div>
          </div>
          ${e.bullets?.length ? `<ul>${e.bullets.map(b => `<li>${esc(b)}</li>`).join('')}</ul>` : ''}
        </div>`).join('')}
      </div>` : ''}
    </div>
  </div>

  </body></html>`;
};

const esc = (s) => String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');

module.exports = { meta, toHTML };
