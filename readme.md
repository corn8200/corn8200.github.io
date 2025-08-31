# Project Overview

This repository hosts a personal website primarily serving as a resume portal. It features a traditional static site for stable resume links and a new, modernized React-based beta application for an enhanced user experience.

---

# Static Resume Site

JSON‑driven resumes, built locally and served by GitHub Pages. One stable URL per job slug.

JSON‑driven resumes, built locally and served by GitHub Pages. One stable URL per job slug.

## How it works
- You keep each resume as JSON in `data/resumes/`.
- `data/index.json` maps each **slug** to its current **version**.
- `build.mjs` renders static HTML to the **repo root** under `resume/<slug>/v<version>/` and creates a latest pointer at `resume/<slug>/`.
- Custom domain: `jcornelius.net` on the repo `corn8200/corn8200.github.io` (user site → publishes from **root**, not `/docs`).

## Repo layout
```
/  (repo root for user site)
├─ data/
│  ├─ index.json            # registry: [{slug, version, title, aliases}]
│  └─ resumes/              # your JSON files
├─ templates/
│  └─ template_print.html   # single HTML template
├─ build.mjs                # builds static pages to /resume/* and root index
├─ resume/                  # generated output (tracked)
├─ index.html               # autoredirects to default slug
├─ 404.html                 # optional
└─ CNAME                    # contains `jcornelius.net`
```

## Add or update a resume
1) Drop or update a JSON file in `data/resumes/`.
2) Ensure its `meta.slug` and `meta.version` are set (the tools can derive them if missing).
3) Update `data/index.json` to point the slug to the intended version.

## Build and publish
```bash
# from repo root
node build.mjs
git add resume index.html data readme.md
git commit -m "resume: rebuild"
git push
```
GitHub Pages serves from root because this repo is a **user site**. Your custom domain must point here (see Troubleshooting).

## Share links
Use this pattern:
```
https://jcornelius.net/resume/<slug>/
```
Example:
```
https://jcornelius.net/resume/director-of-customer-support/
```
This always shows the latest version for that slug.

## Optional: pull JSONs from iCloud
Source folder on macOS:
```
$HOME/Library/Mobile Documents/com~apple~CloudDocs/Resume/report/versions
```
Manual sync then build:
```bash
rsync -av --delete "$HOME/Library/Mobile Documents/com~apple~CloudDocs/Resume/report/versions/" data/resumes/
node build.mjs
git add data resume index.html
git commit -m "resume: sync/build"
git push
```

## Troubleshooting custom domain
- Repo: `corn8200/corn8200.github.io` (user site). Pages publishes from **root**.
- `CNAME` file content: `jcornelius.net`.
- DNS records:
  - Apex `jcornelius.net` → **A**: `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
  - `www.jcornelius.net` → **CNAME** → `corn8200.github.io`
- GitHub → **Settings → Pages**: Custom domain `jcornelius.net`, **Enforce HTTPS** on.
# Modernized Resume Application (Beta)

**A new React (Vite) app is being developed as a modernized beta version of the resume site.**

- The React (Vite) app is developed in a separate repository (`../My_website_react`).
- It builds into `My_website/beta/` within this repository, ensuring it does not affect the live static site.
- The React app reads the existing `data/` JSON files from this repository.

**Current beta URLs:**
  - https://jcornelius.net/beta/#/view
  - https://jcornelius.net/beta/#/view/director-of-customer-support

**Features so far:**
- Modern styling
- Expandable/collapsible sections
- Education section restored
- Certifications added
- Summary expanded by default

**Known work in progress:**
- Timeline for experience (not yet functional)
- Adding visual skills
- Project portfolio
- Contact form

Feedback and suggestions are welcome!.

---
## Update Workflow (exact steps)

### Fast path (manual, 3 steps)
1. **Save** a new JSON in your resume app (iCloud path below).
2. **Update site** from the website repo root:
   ```bash
   # 1) Copy newest JSON from iCloud into the site
   SRC_DIR="$HOME/Library/Mobile Documents/com~apple~CloudDocs/Resume/report/versions"
   NEWEST="$(ls -t "$SRC_DIR"/*.json | head -n 1)"
   mkdir -p data/resumes
   cp -f "$NEWEST" data/resumes/
   echo "Copied: $NEWEST"

   # 2) Normalize + register + build
   node - <<'NODE'
   const fs=require('fs'),path=require('path');
   const idxPath='data/index.json', dir='data/resumes';
   const files=fs.readdirSync(dir).filter(f=>f.endsWith('.json')).map(f=>path.join(dir,f))
                 .sort((a,b)=>fs.statSync(b).mtime-fs.statSync(a).mtime);
   const newest=files[0]; const idx=JSON.parse(fs.readFileSync(idxPath,'utf8'));
   const kebab=s=>s.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'').replace(/-+/g,'-');
   const bump=v=>{const [a,b,c]=(v||'0.0.0').split('.').map(n=>+n||0);return [a,b,c+1].join('.')};
   let doc=JSON.parse(fs.readFileSync(newest,'utf8')); doc.meta=doc.meta||{};
   let slug=doc.meta.slug||kebab(doc.title||doc.name||path.basename(newest,'.json'));
   let ver =doc.meta.version; const existing=idx.variants.find(v=>v.slug===slug);
   if(!ver) ver= existing? bump(existing.version): '1.0.0';
   doc.meta.slug=slug; doc.meta.version=ver;
   doc.meta.title=doc.meta.title||doc.title||'Resume'; doc.meta.aliases=Array.isArray(doc.meta.aliases)?doc.meta.aliases:[];
   const newName=path.join(dir, `${slug}@${ver}.json`);
   fs.writeFileSync(newName, JSON.stringify(doc,null,2)); if(newest!==newName){try{fs.unlinkSync(newest)}catch{}}
   if(!existing) idx.variants.push({slug,version:ver,title:doc.meta.title,aliases:doc.meta.aliases}); else existing.version=ver;
   if(!idx.default) idx.default=slug;
   fs.writeFileSync(idxPath, JSON.stringify(idx,null,2));
   console.log('Registered', slug, 'v'+ver);
   NODE

   node build.mjs

   # 3) Publish
   git add data resume index.html
   git commit -m "resume: rebuild"
   git push
   ```

3. **Send link**  
   - Static: `https://jcornelius.net/resume/<slug>/`  
   - Beta:   `https://jcornelius.net/beta/#/view/<slug>`

### Automate (recommended): pre-commit hook
Run once in repo root to make updates automatic whenever you commit.
```bash
mkdir -p scripts .git/hooks

# sync from iCloud → data/resumes
cat > scripts/sync-versions.sh <<'SH'
#!/usr/bin/env bash
set -euo pipefail
SRC="$HOME/Library/Mobile Documents/com~apple~CloudDocs/Resume/report/versions"
DEST="data/resumes"
mkdir -p "$DEST"
rsync -av --include="*.json" --exclude="*" "$SRC"/ "$DEST"/
SH
chmod +x scripts/sync-versions.sh

# normalize registry
cat > scripts/normalize-index.mjs <<'NODE'
import fs from 'fs'; import path from 'path';
const dir='data/resumes'; const files=fs.existsSync(dir)?fs.readdirSync(dir).filter(f=>f.endsWith('.json')):[];
const idxPath='data/index.json'; const idx=JSON.parse(fs.readFileSync(idxPath,'utf8'));
const kebab=s=>s.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'').replace(/-+/g,'-');
const semverCmp=(a,b)=>{const pa=a.split('.').map(n=>+n||0),pb=b.split('.').map(n=>+n||0);for(let i=0;i<3;i++){const d=(pa[i]||0)-(pb[i]||0);if(d)return d}return 0};
for(const f of files){
  const p=path.join(dir,f); let d; try{ d=JSON.parse(fs.readFileSync(p,'utf8')); }catch{ continue; }
  d.meta=d.meta||{}; d.meta.slug=d.meta.slug||kebab(d.title||d.name||path.basename(f,'.json'));
  d.meta.version=d.meta.version||'1.0.0';
  d.meta.title=d.meta.title||d.title||'Resume'; d.meta.aliases=Array.isArray(d.meta.aliases)?d.meta.aliases:[];
  fs.writeFileSync(path.join(dir,`${d.meta.slug}@${d.meta.version}.json`), JSON.stringify(d,null,2));
}
const grouped={}; for(const f of fs.readdirSync(dir).filter(f=>f.endsWith('.json'))){
  const d=JSON.parse(fs.readFileSync(path.join(dir,f),'utf8')); const s=d.meta.slug, v=d.meta.version;
  if(!grouped[s] || semverCmp(v,grouped[s].version)>0) grouped[s]={slug:s,version:v,title:d.meta.title,aliases:d.meta.aliases};
}
const variants=Object.values(grouped).sort((a,b)=>a.slug.localeCompare(b.slug));
if(!idx.default && variants[0]) idx.default=variants[0].slug;
idx.variants=variants;
fs.writeFileSync(idxPath, JSON.stringify(idx,null,2));
console.log('index.json updated with', variants.length, 'variant(s)');
NODE

# pre-commit: sync → normalize → build → stage
cat > .git/hooks/pre-commit <<'HOOK'
#!/usr/bin/env bash
set -euo pipefail
scripts/sync-versions.sh
node scripts/normalize-index.mjs
node build.mjs
git add data resume index.html || true
echo "pre-commit: synced, normalized, built, and staged."
HOOK
chmod +x .git/hooks/pre-commit
```
Usage afterwards:
```bash
git commit -m "resume update"
git push
```

### Notes
- Repo is a **user site**; Pages serves from root. Keep `CNAME` = `jcornelius.net`.
- If a JSON is invalid you’ll see a build error; fix the JSON and re-run.
- CDN cache ~5–10 min. `curl -I <url>` shows fresh `age: 0` when updated.

---
## Repo layout options

### Current (two siblings)
- **My_website** → published repo (user site). Contains `/data`, `/resume`, `/beta` (built), `index.html`.
- **My_website_react** → React source. `npm run build` writes into `../My_website/beta/`.

Pros: clear separation; Pages only sees static files. Cons: two folders to juggle.

### Single‑repo (recommended colocation)
Keep **one repo** but place the React source inside it. Only `/beta` is published.

```
My_website/              # GitHub Pages user site (serves from ROOT)
├─ data/                 # JSON resumes
├─ resume/               # built static pages
├─ beta/                 # React build output (what Pages serves at /beta)
├─ app/                  # React source (NOT served)
│  ├─ package.json
│  ├─ vite.config.js     # base:'/beta/',  build.outDir:'../beta'
│  └─ src/ ...
├─ index.html            # can redirect to /beta/#/view or a landing page
└─ readme.md
```

**How to migrate to single‑repo now**

> Run from the current `My_website` repo root.

```bash
# 1) Move React source into this repo under app/
mkdir -p app
rsync -av --exclude=node_modules --exclude=dist --exclude=.git \
  ../My_website_react/ app/

# 2) Adjust Vite to emit to ../beta (already used). Ensure config:
cat > app/vite.config.js <<'EOF'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
export default defineConfig({
  plugins: [react()],
  base: '/beta/',
  build: { outDir: '../beta', emptyOutDir: true }
})
EOF

# 3) Install deps inside app/ and build into ../beta
cd app && npm i && npm run build && cd ..

# 4) Commit the colocated source and the fresh beta output
git add app beta
git commit -m "app: colocate React source; build to /beta"
git push
```

**Daily workflow after colocation**
```
# Edit React in app/
cd app && npm run build
# Publish the new /beta
cd .. && git add beta && git commit -m "beta: update" && git push
```

Notes:
- GitHub Pages still serves only static files from repo root; `app/` is just source.
- Keep `index.html` at root pointing to `/beta/#/view` (or a landing page).
- JSON updates flow stays the same (copy → normalize → build → push).