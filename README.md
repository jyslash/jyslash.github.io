# jyslash.github.io

Jungyoung Lee's life archive — About, Journal, Books, Projects — in Korean and English.
Built with [Astro](https://astro.build), published to GitHub Pages by GitHub Actions. Product decisions live in `PRD.md`.

## Layout

```
content/   the archive: Markdown + YAML (journal, projects, books)
media/     images, served at /media/
src/       the site: pages, layouts, components, styles
scripts/   helpers (image ingest)
```

## Writing a journal entry

1. Add photos (resized, location data stripped):
   ```bash
   npm run ingest -- journal/2026/2026-10-21-first-rain ~/Desktop/IMG_1234.HEIC
   ```
2. Create `content/journal/2026/2026-10-21-first-rain.ko.md`:
   ```markdown
   ---
   title: 첫 비
   date: 2026-10-21
   photos:
     - journal/2026/2026-10-21-first-rain/1.jpg
   ---
   마운틴뷰에 첫 비가 왔다.
   ```
3. Later, the English translation goes in `2026-10-21-first-rain.en.md` with only `title` and the body.
4. Push to `master` — GitHub Actions builds and publishes.

Dates can be as precise as you know them: `1994`, `2016-06`, or `2026-10-21`.

## Local development

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # output in dist/
```
