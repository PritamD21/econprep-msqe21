# EconPrep

ISI MSQE preparation with year-wise PEA objective practice and PEB Question, Hint and Solution tabs. PEB practice is on paper, without answer entry. Includes the syllabus, bookmarks, browser-local performance analytics and topic weightage from indexed source questions.

Created by Pritam Das. Copyright © 2026 Pritam Das. See `COPYRIGHT.md` for original-paper attribution and third-party licensing.

The paper library is the single entry point for reading solutions and starting year-wise practice. PEB solutions use numbered derivation steps, paragraph spacing and aligned LaTeX equations. The duplicate Mock tests navigation has been removed.

The Syllabus section displays the complete original ISI PDF as an unchanged full-page rendering, with the original downloadable PDF and official-source link. The About section introduces ISI Kolkata and the Economic Research Unit, with an attributed campus photograph and official reference links.

The library includes 2025 papers from an attributed mirror and 2026 paper transcriptions from Econschool, with independent solutions. Transcriptions are explicitly labelled and link to their external source PDFs. ISI's official 2026 sample files repeat the 2025 sets and are not presented as the actual 2026 examination. Missing or inconsistent transcribed details are flagged in the relevant solutions.

Serve `dist/` with a static HTTP server, or open `EconPrep.html` with its adjacent `dist/` folder. No build dependencies are needed. Equations use locally bundled KaTeX. Progress is saved in the current browser's localStorage; it does not sync between devices.

The bank preserves original PDFs, source page links and separately identified sample booklets. Some supplied files are duplicated or contain mixed-year pages; source metadata records these cases. Original-source excerpts preserve complex notation for some PEA questions and can be opened at full size.

Answers are independently derived worked solutions, not official answer keys. Questions with source errors, missing assumptions or multiple defensible answers have a visible review flag and are excluded from automatic scoring. PEA uses unweighted practice scoring (+1 correct, 0 otherwise); this is not the official examination marking scheme. PEB records practice and hint usage, without inferring a score.

`content/questions/` contains the editable question records. `dist/paper-bank.json` contains the generated bank and current paper-by-paper coverage. `build_paper_bank.py` rebuilds it from the research working folder when present, otherwise from `content/`; existing PDFs must remain in `dist/papers/`. Run `node check_paper_bank.cjs` and `node check_insights.cjs` for content, asset, equation and analytics checks. Run `python package_paper_app.py` to refresh the standalone entry and source ZIP.

No authentication or server-side database is implemented in this interface prototype. The site is published through GitHub Pages from the main branch root. The root entry opens dist/index.html; committing changes to main triggers publication.

The GitHub source repository omits original PDF binaries. The complete local demo and source ZIP include them; publishing the package will make them available on the hosted demo. To restore them after cloning, run `python restore_source_pdfs.py --source-directory "your original PDF folder" --download-official`. Question text, source excerpts, solutions, math assets and the generated bank remain usable without the full PDFs.

Topic weightage counts indexed question items, including descriptive subparts, with year, track and source-kind filters. Incomplete years are explicitly labelled; missing content is not treated as a zero-frequency topic. Future GATE, JAM, CUET PG and Android support are planned. The separately maintained portfolio is linked from creator credits. The previous hosted demo address is not stored in this repository.
