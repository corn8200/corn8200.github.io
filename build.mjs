import fs from 'fs'; import path from 'path';

const tpl = fs.readFileSync('templates/template_print.html','utf8');
const registry = JSON.parse(fs.readFileSync('data/index.json','utf8'));

function sanitize(s){
  if (s == null) return '';
  // Fix common mojibake
  return String(s)
    .replace(/â€“/g,'–')
    .replace(/â€”/g,'—')
    .replace(/â€™/g,"’")
    .replace(/â€œ/g,'“')
    .replace(/â€/g,'”')
    .replace(/â€¢/g,'•')
    .replace(/Â·/g,'·')
    .replace(/Â /g,' ');
}

function render(t, ctx){
  // Sections for arrays
  t = t.replace(/\{\{#(\w+)\}\}([\s\S]*?)\{\{\/\1\}\}/g, (_, key, inner)=>{
    const val = ctx[key];
    if (Array.isArray(val)) {
      return val.map(item=>{
        if (item && typeof item === 'object') {
          let block = inner;
          block = block.replace(/\{\{(\w+)\}\}/g, (_m,k)=> sanitize(item[k] ?? ''));
          // Handle nested simple arrays like bullets/duties
          block = block.replace(/\{\{#(\w+)\}\}([\s\S]*?)\{\{\/\1\}\}/g, (m2,k2,inner2)=>{
            const arr = item[k2];
            return Array.isArray(arr) ? arr.map(v=> inner2.replace(/\{\{\.\}\}/g, sanitize(v))).join('') : '';
          });
          return block;
        }
        return inner.replace(/\{\{\.\}\}/g, sanitize(item));
      }).join('');
    }
    // For truthy non-arr, include once
    if (val) return inner;
    return '';
  });

  // Simple vars
  t = t.replace(/\{\{(\w+)\}\}/g, (_m,k)=> sanitize(ctx[k] ?? ''));
  return t;
}

function normalizeModel(doc){
  const m = doc.meta || {};
  const name = doc.name || m.name || 'John Cornelius';
  const role = doc.title || m.role || 'Program Manager';
  const location = (doc.contact && doc.contact.location) || m.location || '';
  const summary = doc.summary || '';
  // Skills: accept either key-value object or string/array
  let skills_kv = null, skills_list = null;
  if (doc.skills && !Array.isArray(doc.skills) && typeof doc.skills === 'object'){
    skills_kv = Object.entries(doc.skills).map(([k,arr])=>({k, v: Array.isArray(arr)? arr.join('; ') : String(arr)}));
  } else if (Array.isArray(doc.skills)) {
    skills_list = doc.skills.join(', ');
  }
  // Experience unify
  const exp = Array.isArray(doc.experience) ? doc.experience.map(e=>({    title: e.title || '',
    company: e.company || '',
    location_sep: e.location ? '— ' + e.location : '',
    dates: e.dates || [e.start, e.end].filter(Boolean).join(' — '),
    duties: Array.isArray(e.duties)? e.duties : Array.isArray(e.bullets)? e.bullets : [],
    achievements: Array.isArray(e.achievements)? e.achievements : null
  })) : [];

  const education = Array.isArray(doc.education)? doc.education : null;

  return {
    name, role, location, summary, skills_kv, skills_list,
    experience: exp, education,
    slug: m.slug, version: m.version
  };
}

function writeFile(p, s){ fs.mkdirSync(path.dirname(p), {recursive:true}); fs.writeFileSync(p, s); }

function buildVariant(v){
  const slug = v.slug;
  const jsonPath = findJsonFor(slug, v.version);
  const doc = JSON.parse(fs.readFileSync(jsonPath,'utf8'));
  const model = normalizeModel(doc);
  const html = render(tpl, model);
  const outDir = path.join('docs','resume',slug, 'v'+model.version);
  writeFile(path.join(outDir,'index.html'), html);
  // latest pointer
  writeFile(path.join('docs','resume',slug,'index.html'),
    '<!doctype html><meta http-equiv="refresh" content="0; url=./v'+model.version+'/">');
}

function findJsonFor(slug, version){
  // Prefer filename slug@version.json; else scan for meta.slug match
  const p1 = path.join('data','resumes',`${slug}@${version}.json`);
  if (fs.existsSync(p1)) return p1;
  const files = fs.readdirSync('data/resumes').filter(f=>f.endsWith('.json'));
  for (const f of files){
    const full = path.join('data','resumes',f);
    try{
      const doc = JSON.parse(fs.readFileSync(full,'utf8'));
      if (doc?.meta?.slug === slug && doc?.meta?.version === version) return full;
    }catch{}
  }
  throw new Error(`JSON not found for ${slug} v${version}`);
}

function main(){
  for (const v of registry.variants){ buildVariant(v); }
  // Root index redirect to default
  writeFile('docs/index.html',
    '<!doctype html><meta http-equiv="refresh" content="0; url=/resume/'+registry.default+'/">');
  console.log('Built', registry.variants.length, 'variant(s). Default:', registry.default);
}
main();