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
