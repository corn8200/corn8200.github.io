# Portfolio/CV GitHub Pages Setup Instructions

To set up your portfolio/CV site using GitHub Pages, follow these steps:

- **Repository Structure:**
  - Your project repository should have the following structure:
    ```
    / (root)
    ├── index.html       # Main HTML file for your portfolio/CV
    ├── css/             # Folder containing your CSS files
    ├── js/              # Folder containing your JavaScript files
    ├── images/          # Folder for images used in your portfolio
    └── README.md        # Optional project description
    ```
  
- **Required Files:**
  - `index.html`: The entry point of your site.
  - CSS files: Stylesheets to style your portfolio.
  - JavaScript files (optional): For any interactive features.
  - Images: Photos, logos, or any graphics used on your site.
  
- **Deployment Steps:**
  1. Push your project to a GitHub repository.
  2. Go to the repository on GitHub.
  3. Click on the **Settings** tab.
  4. Scroll down to the **Pages** section.
  5. Under **Source**, select the branch you want to publish (usually `main` or `master`) and the folder (root `/` or `/docs`).
  6. Click **Save**.
  7. Your site will be published at `https://<your-username>.github.io/<repository-name>/`.
  8. Wait a few minutes for GitHub Pages to build and deploy your site.

- **Tips:**
  - Use relative links for assets to ensure they work correctly on GitHub Pages.
  - Test your site locally before pushing changes.
  - Customize your `index.html` to reflect your personal information and portfolio items.

# Resume Versioning System

A JSON-driven resume website powered by GitHub Pages. Store multiple resume versions as JSON files, and share individual versions via unique URLs.

## Folder Structure
```
/ (root)
├── index.html         # Main site entry
├── resume/            # Folder for JSON resume files
├── css/               # Stylesheets
├── js/                # JavaScript logic
├── images/            # Optional images
└── readme.md          # This file
```

## Adding or Updating Resume JSON
- Place new resume versions in the `resume/` folder as JSON files (e.g., `resume/my-latest.json`).
- To update a version, edit the corresponding JSON file.
- Each JSON file should follow the required schema (see sample in `resume/` folder).

## Building Locally
1. Clone the repository.
2. Open `index.html` in your browser.
3. For advanced testing, use a local server (e.g., `npx serve` or Python’s `http.server`) to avoid CORS issues.

## Sharing Resume Links
- Each resume JSON is accessible via a **slug** URL:  
  `https://<your-username>.github.io/<repo>/#/<slug>`
  - Example: `.../#/my-latest`
- Optionally, create an **alias** (short link) by mapping a custom name to a resume file in the configuration.

## GitHub Pages Deployment
- Push changes to your repository.
- In GitHub, go to **Settings > Pages** and set the source branch/folder (usually `main` and `/`).
- Your site will be live at:  
  `https://<your-username>.github.io/<repo>/`
- Changes may take a few minutes to deploy.
# Resume Links on GitHub Pages

Purpose: host multiple **job-specific resume versions** and share a stable link per job. All data lives in JSON. The site builds static HTML into `docs/` for GitHub Pages.

## Repo Layout
```
/ (website root)
├─ data/
│  ├─ index.json            # registry of variants (slug → current version)
│  └─ resumes/              # your JSON files from iCloud “versions”
├─ templates/
│  └─ template_print.html   # single HTML template
├─ build.mjs                # builds static pages from JSON + template
├─ docs/                    # Pages output (served by GitHub Pages)
└─ .github/workflows/       # optional CI (not required)
```

## Add or Update a Resume
1) Put your JSON file(s) in `data/resumes/`.  
   - File name can be anything (`snc-pm@1.2.0.json` recommended).  
   - Each file should have `meta.slug` and `meta.version` (the tools can derive them if missing).

2) Update `data/index.json` to point each `slug` to its current `"version"`.

3) Build pages:
```
node build.mjs
```
Outputs to: `docs/resume/<slug>/v<version>/index.html` and a redirect at `docs/resume/<slug>/index.html` pointing to latest.

## Share Links
Give recruiters this URL format:
```
https://<username>.github.io/<repo>/resume/<slug>/
```
Example:
```
https://jcornelius.github.io/My_website/resume/director-of-customer-support/
```
That URL always shows the latest version for that slug after you rebuild and push.

## Minimal Workflow (manual)
```
# from website repo root
# 1) copy JSONs into data/resumes/
# 2) adjust data/index.json
node build.mjs
git add data docs
git commit -m "resume: update"
git push
```

## Optional: Sync from iCloud “versions”
Source folder on macOS:
```
$HOME/Library/Mobile Documents/com~apple~CloudDocs/Resume/report/versions
```
Manual sync then build:
```
rsync -av --delete "$HOME/Library/Mobile Documents/com~apple~CloudDocs/Resume/report/versions/" data/resumes/
node build.mjs
git add data docs
git commit -m "resume: sync/build"
git push
```

## GitHub Pages Settings
Set **Settings → Pages** to serve from branch `main`, folder **/docs**. If you remove `/docs`, Pages won’t build.