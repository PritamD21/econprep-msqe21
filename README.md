# EconPrep — ISI MSQE Preparation

Demo interface for ISI MSQE entrance preparation.

## Included

- PEA multiple-choice practice with a timer and scoring.
- PEB Question, Hint, and Solution tabs for practice on paper.
- Paper-year library for 1998–2024 (content import pending).
- Official 2026 syllabus overview.
- Bookmarks and browser-local practice history.
- Analytics: session history, paper/date filters, PEA score trends, topic accuracy, and PEB practice/hint usage.
- Topic Weightage: question-share calculations and paper/year filters, awaiting verified past-paper topic tags.

## Run locally

Open EconPrep.html directly, or serve dist with any static HTTP server:

```sh
python -m http.server 8000 --directory dist
```

No build step or dependencies are required. Edit files in dist for development. EconPrep.html is a standalone snapshot.

Run the aggregation checks with Node.js:

```sh
node check_insights.cjs
```

## Data and status

This is a demo. Questions are original samples; full past papers and verified solutions have not been imported. Analytics records topic-level results for new sessions; older sessions retain their aggregate scores. PEB practice is self-reviewed, not automatically graded. Topic Weightage uses verified past-paper question tags only; demo attempts never affect it, and percentages remain unavailable before tagging. Data is stored in this browser; accounts, cloud sync, and the Android app are planned. GATE, JAM, and CUET PG are planned.

This repository intentionally contains no hosted demo link, hosting configuration, credentials, or source PDFs.
