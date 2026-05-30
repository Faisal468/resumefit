/**
 * Classic Template — Times New Roman, centered header, traditional horizontal rules.
 * Highest ATS compatibility. Suits finance, law, academia.
 */

const meta = {
  id: 'classic',
  name: 'Classic',
  description: 'Traditional single-column layout. Timeless and universally ATS-safe.',
  font: 'Times New Roman',
  accentColor: '#000000',
  previewColors: { bg: '#ffffff', header: '#000000', accent: '#555555' },
};

const toHTML = (d, isSinglePage = false) => {
  const fs = isSinglePage ? '10.5pt' : '11pt';
  const lh = isSinglePage ? '1.25' : '1.35';
  const gap = isSinglePage ? '7px' : '11px';
  const secGap = isSinglePage ? '3px' : '5px';

  return `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>
  *{margin:0;padding:0;box-sizing:border-box}
  body{font-family:'Times New Roman',Times,serif;font-size:${fs};color:#000;line-height:${lh}}
  .header{text-align:center;margin-bottom:6px}
  .name{font-size:${isSinglePage ? '17pt' : '20pt'};font-weight:700;letter-spacing:0.5px;text-transform:uppercase}
  .contact{font-size:9.5pt;margin-top:3px;color:#222}
  .sep{display:inline;margin:0 6px}
  hr.thick{border:none;border-top:2px solid #000;margin:5px 0}
  hr.thin{border:none;border-top:1px solid #000;margin:3px 0}
  .section{margin-bottom:${gap}}
  .section-title{font-size:${isSinglePage ? '10.5pt' : '11.5pt'};font-weight:700;text-transform:uppercase;letter-spacing:1px;margin-bottom:${secGap}}
  .entry{margin-bottom:${isSinglePage ? '5px' : '8px'}}
  .row{display:flex;justify-content:space-between;align-items:baseline}
  .entry-title{font-weight:700}
  .entry-sub{font-style:italic;font-size:10.5pt}
  .entry-date{font-size:10pt;font-style:italic;white-space:nowrap;margin-left:8px}
  ul{padding-left:18px;margin-top:2px}
  li{margin-bottom:1px}
  .skills-wrap{display:flex;flex-wrap:wrap;gap:2px}
  .sk::after{content:' •';margin-right:3px}
  .sk:last-child::after{content:''}
  .summary{font-size:${fs};text-align:justify}
  </style></head><body>
  <div class="header">
    <div class="name">${esc(d.personalInfo.name)}</div>
    <div class="contact">
      ${[d.personalInfo.email, d.personalInfo.phone, d.personalInfo.location,
         d.personalInfo.linkedin, d.personalInfo.github, d.personalInfo.website]
        .filter(Boolean).map(v => `<span>${esc(v)}</span>`).join('<span class="sep">|</span>')}
    </div>
  </div>
  <hr class="thick"/>

  ${d.summary ? `
  <div class="section">
    <div class="section-title">Summary</div>
    <hr class="thin"/>
    <div class="summary">${esc(d.summary)}</div>
  </div>` : ''}

  ${d.experience?.length ? `
  <div class="section">
    <div class="section-title">Experience</div>
    <hr class="thin"/>
    ${d.experience.map(e => `
    <div class="entry">
      <div class="row">
        <div><span class="entry-title">${esc(e.title)}</span>${e.company ? `, <span class="entry-sub">${esc(e.company)}</span>` : ''}${e.location ? ` — ${esc(e.location)}` : ''}</div>
        <div class="entry-date">${esc(e.startDate)}${e.endDate ? ` – ${esc(e.endDate)}` : ''}</div>
      </div>
      ${e.bullets?.length ? `<ul>${e.bullets.map(b => `<li>${esc(b)}</li>`).join('')}</ul>` : ''}
    </div>`).join('')}
  </div>` : ''}

  ${d.education?.length ? `
  <div class="section">
    <div class="section-title">Education</div>
    <hr class="thin"/>
    ${d.education.map(e => `
    <div class="entry">
      <div class="row">
        <div><span class="entry-title">${esc(e.degree)}</span>${e.school ? `, <span class="entry-sub">${esc(e.school)}</span>` : ''}${e.location ? ` — ${esc(e.location)}` : ''}</div>
        <div class="entry-date">${esc(e.graduationYear || '')}</div>
      </div>
      ${e.gpa ? `<div style="font-size:10pt">GPA: ${esc(e.gpa)}</div>` : ''}
    </div>`).join('')}
  </div>` : ''}

  ${d.skills?.length ? `
  <div class="section">
    <div class="section-title">Skills</div>
    <hr class="thin"/>
    <div class="skills-wrap">
      ${d.skills.map(s => `<span class="sk">${esc(s)}</span>`).join('')}
    </div>
  </div>` : ''}

  ${d.projects?.length ? `
  <div class="section">
    <div class="section-title">Projects</div>
    <hr class="thin"/>
    ${d.projects.map(p => `
    <div class="entry">
      <div class="entry-title">${esc(p.name)}${p.link ? ` <span style="font-weight:400;font-style:italic;font-size:9.5pt">(${esc(p.link)})</span>` : ''}</div>
      ${p.description ? `<div>${esc(p.description)}</div>` : ''}
      ${p.technologies?.length ? `<div style="font-style:italic;font-size:10pt">${p.technologies.map(esc).join(', ')}</div>` : ''}
    </div>`).join('')}
  </div>` : ''}

  ${d.certifications?.length ? `
  <div class="section">
    <div class="section-title">Certifications</div>
    <hr class="thin"/>
    <ul>${d.certifications.map(c => `<li>${esc(c)}</li>`).join('')}</ul>
  </div>` : ''}

  </body></html>`;
};

const esc = (s) => String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');

module.exports = { meta, toHTML };
