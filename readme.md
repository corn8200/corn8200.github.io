# My Website - React Application

This repository hosts a personal website built with React (Vite). It serves as a modernized version of a resume site.

## Project Structure

The React application source code is located in the `app/` directory.

```
My_website/
├─ app/                  # React source
│  ├─ package.json
│  ├─ vite.config.js
│  └─ src/ ...
├─ index.html            # Main entry point (likely for the React app)
├─ readme.md
```

## Getting Started

To run the application locally:

1.  **Navigate to the `app` directory**:
    ```bash
    cd app
    ```
2.  **Install dependencies**:
    ```bash
    npm install
    ```
3.  **Start the development server**:
    ```bash
    npm run dev
    ```
    The application should now be running at `http://localhost:5173` (or another port if 5173 is in use).
    During local development, the app will serve JSON from the root-level `data/` folder so that
    requests to `/data/index.json` and `/data/resumes/*.json` work without changing production URLs.

    To load JSON from another host (e.g., your resume API), set `VITE_DATA_BASE`:
    ```bash
    VITE_DATA_BASE=https://example.com npm run dev
    ```
    The app will fetch `index.json` and resume files from that base URL.

## Building for Production

To create a production build of the application:

1.  **Navigate to the `app` directory**:
    ```bash
    cd app
    ```
2.  **Run the build command**:
    ```bash
    npm run build
    ```
    This will generate optimized static assets in the `cv/` directory (default).

## Features

*   Modern styling
*   Expandable/collapsible sections
*   Education section
*   Certifications
*   Summary

## Deployment

This application is deployed as a static site under `/cv`. Running `npm run build` outputs to the repo’s `cv/` folder with the correct base path so assets resolve without redirects.

---

**Note:** This `README.md` has been updated to reflect the current state of the repository as a React application. Previous content related to a static resume site has been removed or condensed for clarity.
