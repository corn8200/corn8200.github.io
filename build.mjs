
import fs from 'fs';
import path from 'path';

const tpl = fs.readFileSync('templates/template_print.html', 'utf8');
const registry = JSON.parse(fs.readFileSync('data/index.json', 'utf8'));

function sanitize(s) {
  if (s == null) return '';
  return String(s)
    .replace(/â€“|--/g, '–')
    .replace(/â€”/g, '—')
    .replace(/â€™/g, "’")
    .replace(/â€œ/g, '“')
    .replace(/â€/g, '”')
    .replace(/â€¢/g, '•')
    .replace(/Â·/g, '·')
    .replace(/Â /g, ' ');
}

function render(template, context) {
  let output = template;

  // Simple replacements
  output = output.replace(/\{\{name\}\}/g, sanitize(context.name));
  output = output.replace(/\{\{role\}\}/g, sanitize(context.role));
  output = output.replace(/\{\{location\}\}/g, sanitize(context.location));
  output = output.replace(/\{\{version\}\}/g, sanitize(context.version));

  // Summary
  if (context.summary) {
    output = output.replace(/\{\{#summary\}\}([\s\S]*?)\{\{\/summary\}\}/g, `
    <div class="section">
      <h2>Summary</h2>
      <p>${sanitize(context.summary)}</p>
    </div>
`);
  } else {
    output = output.replace(/\{\{#summary\}\}([\s\S]*?)\{\{\/summary\}\}/g, '');
  }

  // Skills
  let skillsHtml = '';
  if (context.skills_kv) {
    for (const skill of context.skills_kv) {
      skillsHtml += `<div class="kv"><div class="k">${sanitize(skill.k)}</div><div class="v">${sanitize(skill.v)}</div></div>`;
    }
  }
  if (context.skills_list) {
    skillsHtml += `<p>${sanitize(context.skills_list)}</p>`;
  }
  output = output.replace(/\{\{#skills_kv\}\}([\s\S]*?)\{\{\/skills_kv\}\}/g, skillsHtml);
  output = output.replace(/\{\{#skills_list\}\}([\s\S]*?)\{\{\/skills_list\}\}/g, '');

  // Experience
  let expHtml = '';
  if (context.experience) {
    for (const job of context.experience) {
      let dutiesHtml = '';
      if (job.duties) {
        dutiesHtml = '<ul>';
        for (const duty of job.duties) {
          dutiesHtml += `<li>${sanitize(duty)}</li>`;
        }
        dutiesHtml += '</ul>';
      }

      let achievementsHtml = '';
      if (job.achievements) {
        achievementsHtml = '<div class="ach"><h4>Achievements</h4><ul>';
        for (const achievement of job.achievements) {
          achievementsHtml += `<li>${sanitize(achievement)}</li>`;
        }
        achievementsHtml += '</ul></div>';
      }

      expHtml += `
        <div class="job">
          <div class="head">${sanitize(job.title)}, ${sanitize(job.company)} ${sanitize(job.location_sep)} ${sanitize(job.dates)}</div>
          ${dutiesHtml}
          ${achievementsHtml}
        </div>
      `;
    }
  }
  output = output.replace(/\{\{#experience\}\}([\s\S]*?)\{\{\/experience\}\}/g, expHtml);

  // Education
  let eduHtml = '';
  if (context.education) {
    for (const edu of context.education) {
      eduHtml += `<div><strong>${sanitize(edu.degree)}</strong>, ${sanitize(edu.school)}${edu.details ? ` — ${sanitize(edu.details)}` : ''}</div>`;
    }
  }
  output = output.replace(/\{\{#education\}\}([\s\S]*?)\{\{\/education\}\}/g, eduHtml);

  return output;
}

function normalizeModel(doc) {
  const m = doc.meta || {};
  const name = doc.name || m.name || 'John Cornelius';
  const role = doc.title || m.role || 'Program Manager';
  const location = (doc.contact && doc.contact.location) || m.location || '';
  const summary = doc.summary || null;

  let skills_kv = null, skills_list = null;
  if (doc.skills && typeof doc.skills === 'object' && !Array.isArray(doc.skills)) {
    skills_kv = Object.entries(doc.skills).map(([k, arr]) => ({ k, v: Array.isArray(arr) ? arr.join('; ') : String(arr) }));
  } else if (Array.isArray(doc.skills)) {
    skills_list = doc.skills.join(', ');
  }

  const experience = (Array.isArray(doc.experience) && doc.experience.length > 0) ? doc.experience.map(e => ({
    title: e.title || '',
    company: e.company || '',
    location_sep: e.location ? `– ${e.location}` : '',
    dates: e.dates || [e.start, e.end].filter(Boolean).join(' – '),
    duties: [].concat(e.duties || [], e.bullets || []),
    achievements: (Array.isArray(e.achievements) && e.achievements.length > 0) ? e.achievements : null
  })) : null;

  const education = (Array.isArray(doc.education) && doc.education.length > 0) ? doc.education.map(e => ({
    ...e,
    details: e.details || ''
  })) : null;

  return {
    name, role, location, summary, skills_kv, skills_list,
    experience, education,
    slug: m.slug, version: m.version
  };
}

function writeFile(p, s) {
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, s);
}

function buildVariant(v) {
  const slug = v.slug;
  const jsonPath = findJsonFor(slug, v.version);
  if (!jsonPath) {
    console.error(`Could not find JSON for slug: ${slug} v${v.version}`);
    return;
  }
  const doc = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  const model = normalizeModel(doc);
  const html = render(tpl, model);
  const outDir = path.join('resume', slug, 'v' + model.version);
  writeFile(path.join(outDir, 'index.html'), html);
  writeFile(path.join('resume', slug, 'index.html'),
    `<!doctype html><meta http-equiv="refresh" content="0; url=./v${model.version}/">`);
}

function findJsonFor(slug, version) {
  const p1 = path.join('data', 'resumes', `${slug}@${version}.json`);
  if (fs.existsSync(p1)) return p1;
  const files = fs.readdirSync(path.join('data', 'resumes'));
  for (const f of files) {
    if (!f.endsWith('.json')) continue;
    const full = path.join('data', 'resumes', f);
    try {
      const doc = JSON.parse(fs.readFileSync(full, 'utf8'));
      if (doc?.meta?.slug === slug && doc?.meta?.version === version) return full;
    } catch (e) {
      console.error(`Skipping invalid JSON: ${f}`, e);
    }
  }
  return null;
}

function main() {
  const variants = registry.variants || [];
  for (const v of variants) {
    buildVariant(v);
  }
  if (registry.default) {
    writeFile('index.html',
      `<!doctype html><meta http-equiv="refresh" content="0; url=/resume/${registry.default}/">`);
  }
  console.log('Built', variants.length, 'variant(s). Default:', registry.default);
}

main();
