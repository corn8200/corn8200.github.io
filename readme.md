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

Feedback and suggestions are welcome!