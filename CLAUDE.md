# CLAUDE.md

This file provides guidance for AI assistants working in this repository.

## Project Overview

A personal **life archive** for Jungyoung Lee: About (life history), Journal, Books, Projects — in Korean and English. Built with **Astro** as a static site, deployed to **GitHub Pages** by GitHub Actions.

`PRD.md` is the source of truth for product decisions. Read it before structural changes.

## Repository Structure

```
content/              # The archive. Markdown + YAML only, no site code.
  journal/<year>/<id>.ko.md / .en.md
  projects/<id>.ko.md / .en.md
  books/<id>.ko.md / .en.md
media/                # Images, served at /media/ (src/integrations/media.mjs)
src/
  content.config.ts   # Collection schemas (strict: unknown fields fail the build)
  lib/archive.ts      # Pairs ko/en files, fallbacks, required fields, timeline
  lib/i18n.ts         # UI strings + language helpers
  lib/dates.ts        # 1994 / 2016-06 / 2026-10-21 dates with precision
  lib/legacy.ts       # Old Jekyll URLs -> new pages
  pages/[lang]/...    # /ko/… and /en/…; / redirects by visitor language
  layouts/, components/, styles/global.css, scripts/site.js
scripts/ingest.mjs    # Resize + strip EXIF/GPS for every new image
site.config: src/site.config.mjs (title, mediaBase)
```

## Content rules

- An entry's **id is its filename** without the language suffix; it never changes once published.
- The **ko file** holds all metadata; the **en file** holds only translated text (`title`, `description`, `role`, `note`, body). Missing text falls back to the other language with a "not translated yet" label.
- Korean is written first; English is translated afterwards.
- Media paths in front matter are relative to `media/` (e.g. `journal/2026/<id>/1.jpg`), never full URLs.
- Every new image goes through `npm run ingest -- <media/subfolder> <files…>`.
- Never put an exact home location or mobile phone number in content.
- `draft: true` entries show in `npm run dev` only.

## Commands

- `npm install` — install dependencies (Node version in `.nvmrc`)
- `npm run dev` — dev server at http://localhost:4321 (runs in the background in Astro 7; `npx astro dev stop` to end it)
- `npm run build` — production build to `dist/`
- `npm run ingest -- journal/2026/<id> photo1.HEIC photo2.jpg` — add images

Visual checks: headless Chrome works for screenshots (`--headless=new --screenshot`). It won't render narrower than ~500px, so check phone widths through a 390px iframe.

## Git Workflow

- **Solo project** — push directly to `master`, no PRs needed. Structural work happens on branches (e.g. `structure-revamp`).
- Always run `git status` before committing to review what's dirty
- Stage selectively when unrelated files are modified
- `.DS_Store` and `.obsidian/` are gitignored — never stage them
- **Never commit or push automatically** — only commit and push when the user explicitly asks
