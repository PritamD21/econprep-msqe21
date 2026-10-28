# EconPrep — ISI MSQE Preparation

Demo interface for ISI MSQE entrance preparation.

## Included

- PEA multiple-choice demo with a timer and scoring.
- PEB questions with Question, Hint, and Solution tabs; practice on paper.
- Paper-year library for 1998–2024 (content import pending).
- Official 2026 syllabus overview.
- Browser-local bookmarks and practice history.

## Run locally

Open EconPrep.html directly in a browser, or serve the dist directory with any static HTTP server.

```sh
python -m http.server 8000 --directory dist
```

No build step or dependencies are required. Edit the files in dist for future development. EconPrep.html is a standalone snapshot of the demo interface.

## Status

This is a demo, not the final application. Questions are original samples; full past papers and verified solutions have not been imported. No accounts or server-side database are implemented. GATE, JAM, and CUET PG are planned.

This repository intentionally does not contain a hosted demo link, hosting configuration, credentials, or source PDFs.
