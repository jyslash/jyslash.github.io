# PRD — Life Archive

Status: **v0.6 — approved** · stack: Astro · Phase 1 built, not yet merged · 2026-10-21 · branch `structure-revamp`

How to read the tags:
- **[Decided]** — agreed
- **[Proposed]** — my suggestion, push back freely
- **[Exploring]** — direction only, not fixed

---

## 1. Why

The current site is a portfolio with posts attached: curated designs, talks, a feed. The new concept is an **archive of myself**, a log of life kept bit by bit, for decades. The goal is not to show off. It is to keep.

That shift changes what "good" means:
- Completeness over polish. A one-line entry from 1998 is as welcome as a polished case study.
- **Longevity over features. The content has to survive redesigns, frameworks, and maybe hosts.** This is the most important factor.
- Low friction over flexibility. If posting is a chore, the archive stops growing.

## 2. Principles

1. **Content outlives the site.** Plain Markdown + YAML front matter, no database, no service lock-in. Images are referenced by a storage-independent path, so where they live can change without touching any entry (§7.4). If the site generator (Astro) is replaced in ten years, the content folder moves over as-is.
2. **Log everything, curate on top.** Every section has an "everything" view. Curation is a flag or layer on the same data, never a separate copy.
3. **Posting is cheap.** A journal entry should take a couple of minutes, including from a phone, through a small personal app if needed (§7.6).
4. **Korean first, English second.** English is a separate translation made later. A missing translation never blocks publishing.
5. **No social layer.** No likes, comments, follower counts, or view counters.

## 3. Information architecture

Top-level menu: **About · Journal · Books · Projects** [Decided]

| Today | Becomes |
|---|---|
| Posts | Journal |
| Designs | Projects |
| Talks | Projects, `type: talk` [Decided]. They also show up in About → Everything through their date. |
| About (donut placeholder) | About (life history) |

Home page (`/`): **Journal** [Decided]

### 3.1 About — life history

- Starts at birth and runs to today. [Decided]
- Two view modes: **Highlight** (default) and **Everything**. [Decided]
- **Everything** is the plainest possible vertical list, chronological, one line per event. [Decided] It pulls from:
  - Journal entries
  - Book events (started / finished)
  - Project events: one per project, on its **launch / publish date** [Decided]
- **Highlight** curates both layout and content. [Decided] Any entry (journal, book, project) can carry `highlight: true`. Highlight groups those entries into life **chapters** (e.g. Childhood, Seoul, Chicago, Naver, LINE, Google), defined in one data file. Chapters give the page its structure and room for richer layout. [Decided]
- Historical moments (birth, schools, moves, jobs) are written as **Journal entries with past dates**, often a single line and no photo. [Decided]
- Everything reads **oldest → newest**, like a life story. [Decided]

### 3.2 Journal

- A few photos + short sentences. [Decided]
- Expected to be the most frequently updated section. [Decided]
- No social features. [Decided]
- **Title is required.** [Decided]
- Feed shows entries newest first. [Decided]
- Every entry has its own permanent URL. [Decided]
  - The **title links to it**, so anyone can open and share a single entry.
  - **Long entries are cut off** in the feed with a "Read more" link to the permanent URL. Short ones show in full.
- Up to **6 photos** per entry. [Decided]

### 3.3 Books

- A log of every book read and currently being read. [Decided]
- Statuses: `reading`, `finished` only, for now. Want-to-read, gave-up and ratings are later, maybe. [Decided]
- Optional note "on the cover", a recommendation shown on or beside the cover image. [Decided]
- Started / finished feed into About → Everything. [Decided]
- **Library blurb:** one small, personal block on the Books page with a short text, a photo and a link. [Decided] Your example:
  > "JY's local library is MV public library and you can find him with her daughter almost every sunday afternoon." (+ a picture, a url)
  - Written in Korean and English like everything else. It's a page-level block, not a field on each book.
- Covers are downloaded and stored when a book is added, never hotlinked. [Decided]

### 3.4 Projects

- A filter: **Selected works** / **Everything**. [Decided] Default view: **Selected works**. [Decided]
- Logs the whole range of work: company projects, side projects, school work, talks, small experiments. [Decided]
- Selected works = entries with `selected: true`. [Decided]
- Each project has a required **launch / publish date** (`date`). It is the one event the project contributes to About → Everything. [Decided]

## 4. Content model

### 4.1 Shared fields (every entity)

| Field | Purpose |
|---|---|
| *id* | **The filename**, without the language suffix: `the-overstory.ko.md` → `the-overstory`. Shared by the ko and en files. Never changes once published. Not typed in front matter. |
| *lang* | **The filename suffix**: `.ko.md` or `.en.md`. Not typed in front matter. |
| `date` | The entity's main date. Journal: when it happened. Project: launch / publish date. (Books use `started` / `finished` instead.) |
| `date_precision` | Optional. Precision follows how the date is written: `1994`, `2016-06`, `2026-10-21`. Old memories are often "sometime in 1994"; the UI prints only what is known. Set it only to narrow a full date (e.g. `2016-06-01` + `month`). |
| `highlight` | Appears in About → Highlight |

### 4.2 Entities

**Journal entry**
```yaml
# 2026-10-21-first-rain.ko.md
title: 첫 비          # required
date: 2026-10-21
date_precision: day
photos:
  - journal/2026/2026-10-21-first-rain/1.jpg   # path under the media root, §7.4
highlight: false
---
마운틴뷰에 첫 비가 왔다.
```

**Book**
```yaml
# the-overstory.ko.md
title: 오버스토리
author: Richard Powers
cover: books/the-overstory.jpg
status: finished        # reading | finished
started: 2026-08-02
finished: 2026-09-15
note: 나무가 주인공인 소설. 천천히 읽을 것.   # optional, shown on the cover
```

**Project**
```yaml
# line-desktop.ko.md
title: LINE Desktop
org: LINE               # company, when there is one: Google | LINE | Naver
type: product           # product | side | old | talk
date: 2016-06           # launch / publish date, required
date_precision: month
role: Lead Designer
cover: projects/line-desktop/cover.png
selected: true
highlight: false
links: []               # talks keep their external link here
```

**Chapter** (data file, About → Highlight)
```yaml
# content/chapters.yml
- id: chicago
  from: 2008
  to: 2011
  title: { ko: 시카고, en: Chicago }
```

**Library blurb** (page-level content, ko + en files like any entry)
```yaml
# library.ko.md
photo: books/library.jpg
url: https://www.mountainview.gov/our-city/departments/library
---
JY의 동네 도서관은 마운틴뷰 공공 도서관. 거의 매주 일요일 오후 ...
```

## 5. Bilingual

- **[Decided]** All content is available in Korean and English.
- **[Decided]** Korean is written first. English is translated afterwards with Claude, as its own text, not mixed into the Korean source.
- **[Decided]** The default language follows the visitor's browser locale. Visitors can switch, and the choice is remembered.
- **[Decided] One file per language**, side by side: `the-overstory.ko.md` and `the-overstory.en.md`, linked by `id`.
  - The **ko file is the source of truth** for everything that isn't text (dates, photos, flags, status).
  - The **en file holds only translated text** (title, body, note).
- **[Decided] Missing translation:** the English view shows the Korean entry with a small "not translated yet" label. Entries never disappear.
- **[Decided] Translation backlog:** a simple list (or script) of ko files with no en sibling, which we work through together.
- **[Decided]** UI strings (menu labels, "Started reading", "Finished") live in `src/i18n/` (site code, not content).
- The current `korean_content` front matter pattern goes away.
- **[Decided] Separate pages per language**: `/ko/…` and `/en/…`. Each language version is shareable on its own and works without JS. `/` sends visitors to their locale.

## 6. Design direction

Status: **exploring**. Nothing visual is fixed yet. This section captures the intent so the structure doesn't block it later.

### 6.1 Concept

- Each landing page (About, Journal, Books, Projects) is its own **room**. [Decided]
  - its own **background color / mood**
  - its own **signature navigation control**, on top of the shared top nav
  - **very interactive**: the landing pages are where the site plays
- Single-entry pages (one journal entry, one book, one project) share a calmer reading layout. [Decided]

### 6.2 Per section

| Section | Background | Signature control | Status |
|---|---|---|---|
| **About** | TBD | **Timeline scrubber**: a drag handle bar fixed at the bottom, spanning birth → today. Dragging moves through the life story; chapters are marked on the bar; the current year shows on the handle. | [Exploring] |
| **Journal** | TBD | TBD. One idea: a year / month strip to jump through time. | [Exploring] |
| **Books** | TBD | **3D book grid**: every book rendered as a 3D object (cover, spine, thickness), tilting slightly as the cursor moves. Cover notes reveal on hover / tap. | [Exploring] |
| **Projects** | TBD | TBD. One idea: the Selected / Everything switch itself as the signature control. | [Exploring] |

### 6.3 Motion between states

- **Every view change is animated, never a hard swap.** [Decided]
  - About: Highlight ↔ Everything
  - Projects: Selected works ↔ Everything
  - Moving between sections: the background color carries over into the next room's color
- [Decided] Items that appear in both views **move from their old position to their new one**; items only in one view fade in or out. Built on the browser's View Transitions API, which Astro supports out of the box, with a simple fade where unsupported.
- [Decided] **Morphing for the big reduction.** Highlight → Everything is a dramatic drop in UI: rich chapter layouts with photos and large type collapse into plain one-line rows. The switch should show that as one continuous morph, not a cut. [Exploring] how:
  - each highlighted card **shrinks into its own row**: the title glides and scales down into the row's text, the photo shrinks into a small marker or fades out, the card's frame dissolves
  - the non-highlighted rows **unfold in between**, staggered outward from the morphing items, so the list visibly "fills in"
  - Everything → Highlight runs it in reverse: rows lift and expand back into cards, the extra rows fold away
  - **you stay at the same moment in time**: the year in view before the switch is the year in view after it
  - only what's on screen morphs; rows outside the viewport just appear, which keeps it smooth with thousands of entries
  - Projects (Selected works ↔ Everything) likely uses the same morph, with a smaller drop in UI

### 6.4 Guardrails

Because this is a long-term archive, the effects are a layer on top of the content, never a requirement for it. [Decided]

- **Content first.** Every page is fully readable if JavaScript or an effect fails. A redesign can replace every effect without touching an entry.
- **Reduced motion.** Visitors with "reduce motion" set get simple fades: no tilt, no morphing.
- **Touch.** Every control works by touch. Cursor-driven effects (book tilt) need a phone version, e.g. gentle idle motion.
- **Performance.** About → Everything may list thousands of rows. Animate only position, scale and opacity (no layout-changing properties), and only for what is on screen, so it stays smooth.
- **Light weight.** 3D books with CSS 3D transforms, not a 3D engine. Any library is copied into the repo, not loaded from a CDN, so the site still works in ten years.
- **Dark mode.** Each section color has a light and a dark variant.
- **Keyboard.** The timeline scrubber works with arrow keys; every control has a visible focus state.

### 6.5 To explore later

Not blocking anything before each section's phase:

| # | Question |
|---|---|
| D1 | The four section colors (light + dark) |
| D2 | Journal's signature control |
| D3 | Projects' signature control |
| D4 | Timeline scrubber in Everything mode (thousands of rows) and on phones |
| D5 | Books on phones: tilt from the phone's motion sensor (iOS asks permission) or idle motion |
| D6 | Do the shared top nav and footer take on each section's color? |
| D7 | The Highlight ↔ Everything morph in detail: what a photo becomes in a row, timing and stagger, and how it looks on phones. Worth prototyping early, since it shapes both views. |

## 7. Technical

### 7.1 Longevity: content, build, host, address

Treat these as four separate layers, each replaceable without touching the others:

| Layer | Choice | Lifespan risk | Exit path |
|---|---|---|---|
| **Content** | Markdown + YAML in git | Very low: plain text, every clone is a full copy with history | None needed |
| **Media** | See §7.4 | Depends on where photos live | Paths are storage-independent |
| **Build** | Astro, run by GitHub Actions | Medium: npm dependencies, a major Astro version roughly yearly | Templates are rewritten; content stays |
| **Host** | GitHub Pages | Medium: free service, no guarantee, policy can change | Output is plain HTML; any static host serves it |
| **Address** | `jyslash.github.io` today | **High: dies the day you leave GitHub** | Own domain |

- **[Decided] Own domain.** You'll buy it later. Until then nothing blocks on it, but it should be in place before links get shared widely. Set auto-renew, multiple years.
- [Decided] **GitHub Pages is fine as the host**, as long as nothing depends on it specifically.
- [Decided] **GitHub Actions builds the site**, not GitHub's built-in Jekyll build. Actions runs Astro on every push to `master` and publishes the output to Pages. The output is ordinary static files that could deploy to Cloudflare Pages or Netlify unchanged.
- [Decided] **Two copies outside GitHub:** the clone on your Mac (plus Time Machine) and an automatic mirror to a second git host (e.g. Codeberg or GitLab).
- Pages limits: 1 GB published site, ~100 GB/month bandwidth (soft), repo ideally under 1 GB.

**Visual checks with Claude.** Node is already installed on this Mac, so Claude can run the Astro dev server in the background, open it in the browser, take screenshots, and check desktop and mobile widths itself.

### 7.2 Stack: Astro

- **[Decided] Astro**, chosen over Jekyll, Hugo and Eleventy because the landing pages are meant to be highly interactive (§6). Hugo was the runner-up: lower upkeep, weaker for interactive pages.
- **Static output only.** No server, no database, no hosting adapter. The build produces plain HTML, CSS, JS and images.
- **Content lives outside the site code** (repo layout below). Astro reads `content/`; nothing in `content/` depends on Astro.
- **Content collections with a schema.** Astro checks every entry when building: a journal entry without a title, or a project without a date, fails the build with a clear message instead of rendering a broken page.
- **Bilingual routing**: every page is generated under `/ko/…` and `/en/…`; `/` forwards to the visitor's saved choice or browser language. The ko and en files are paired by filename (§4.1).
- **Page transitions** through Astro's built-in view transitions, replacing the hand-written page-swapping code in today's `app.js`.
- **Old URLs** (`/designs/*`, `/talks/*`, `/about/`, old post dates) forward to the same page in the visitor's language (`src/lib/legacy.ts`).
- **Few dependencies, pinned.** Astro itself plus only what a feature truly needs. No UI framework (React, Svelte…) until a component needs one. Exact versions in the lockfile; Node version pinned in `.nvmrc` and used by Actions too. Astro upgrades happen deliberately, not automatically.

Repo layout:
```
content/       the archive: Markdown + YAML, no site code
  journal/2026/2026-10-21-first-rain.ko.md
  books/  projects/  chapters.yml  library.ko.md
media/         images, served at /media/… (§7.4)
src/           the site: pages, layouts, components, styles, i18n
scripts/       ingest and other helpers
```

### 7.3 Front end
- Keep what works: theme toggle, CSS tokens, fonts, the footer clocks. Page transitions move to Astro's built-in version.
- Layouts are rebuilt per section as Astro components. The current Jekyll layouts are removed.

### 7.4 Media (photos, covers)

**[Decided] Ingest step for every image:**
- resize (e.g. 2000 px on the long edge)
- re-encode (JPEG/WebP around 80% quality)
- **strip EXIF, including GPS location**

Originals stay in your own photo library. The site holds web copies, not the backup.

**Where web copies live:**

| Option | Cost | Pros | Cons |
|---|---|---|---|
| **A. In the git repo** (today) | Free | One place, one backup, works offline | Git keeps every image forever; Pages 1 GB cap |
| **B. Object storage on your domain** (Cloudflare R2 or Backblaze B2, served at e.g. `media.<yourdomain>`) | R2: 10 GB free, then ~$0.015/GB-month, no bandwidth fees | Effectively no size ceiling, cheap, survives any change of site host | Second thing to back up; uploading needs tooling (the script / app does it) |
| C. Git LFS | Paid quota | Stays "in git" | Ties you harder to GitHub, poor fit with Pages. Not recommended. |

How fast does A fill up? A web copy is ~300–500 KB.
- 3 photos a week ≈ 60 MB/year → 1 GB lasts ~15 years.
- 3 photos a day ≈ 450 MB/year → about 2 years.

**[Decided] Make storage swappable from day one:**
- Entries store a **relative media path** (`journal/2026/…/1.jpg`), never a full URL.
- One config value (`media_base`) decides where those paths point.
- Moving from A to B is then: copy the folder to the bucket, change one line. No entry is edited.

**[Decided] Start with A**, using swappable paths. Move to B once the domain exists or the repo passes ~500 MB.

### 7.5 Privacy

- **The repo stays public for now** (2026-10-21). Making it private hides drafts, git history and unpublished files, but:
  - On GitHub's **Free plan, Pages does not work for private repos**, so the site would go offline. Private repo + Pages needs GitHub Pro (~$4/month) or higher.
  - The **published site stays public** either way. Anything that renders is visible to everyone.
  - Revisit before backfilling personal history. Until then, assume every committed file is public.
- **[Decided] Never on the site:** exact home location and mobile phone number. You keep them out of entries; the ingest step strips GPS from photos.
- Anything else (family, places, routines like the library blurb) is decided entry by entry.

### 7.6 Authoring

- **[Decided] Open to building a small personal mobile app** for posting.
- [Decided] Minimal scope:
  - Fields: title, date (defaults to today), Korean text, photos, highlight toggle
  - Runs the ingest step on the phone (resize, strip EXIF)
  - Commits the `.ko.md` file and images through the GitHub API (and uploads to the bucket if §7.4 option B)
  - Optional later: adding a book (search by title, fetch the cover)
- Form (native iOS, installable web app, or iOS Shortcuts): decided at Phase 7, leaning towards an installable web app (PWA) as the cheapest to build and keep alive.
- Until the app exists, desktop posting uses the ingest script + git as usual.
- The Obsidian vault folders inside `_posts`, `_designs`, `_talks` are dropped from git (see §8).

## 8. Migration

- `_posts/` (2) → `content/journal/`
- `_drafts/` (2) → review: keep, move, or drop
- `_designs/` (35) → `content/projects/`
  - `category` → `org`
  - add `selected`, `type`, `date` (launch date)
  - none have body text yet, so this is mostly front matter
- `_talks/` (3) → `content/projects/` with `type: talk`, `date` = when the talk / interview was published, external link in `links`
- Fill gaps found in the current repo:
  - image folders with no entry: `hand-drawings`, `vector-illustrations`, `line-timeline`
  - planned projects with no entry: `google-ios-ecosystem`, `naver-weather-v2`, `college-posters`, `colour`
- `assets/images/` → `media/`
- Remove the Jekyll setup: `_config.yml`, `Gemfile`, `Gemfile.lock`, `.ruby-version`, `_layouts/`
- Remove `.DS_Store` and the `.obsidian/` folders from git tracking
- Planning docs (`PRD.md`, `TODO.md`, `DESIGNS_PLAN.md`, `Project Candidates.md`) stop being published as pages (Astro only builds `src/pages`)
- [Decided] Redirect old `/designs/*` and `/talks/*` URLs
- Update README and CLAUDE.md to describe the new structure

## 9. Phases

0. **Agree on this PRD**
1. **Foundation** — Astro project + Actions workflow, content collections with schema, bilingual routing, 4-menu nav, media path + ingest script, redirects, move existing content into `content/` and `media/`, port the current tokens / theme / footer, shared design pieces (per-section color tokens, view-change animation system), remove Jekyll
2. **Journal** — layouts + migrate posts
3. **Projects** — layouts, Selected / Everything filter, migrate designs and talks
4. **Books** — layouts, library blurb
5. **About → Everything** — the timeline built from 2–4
6. **About → Highlight** — chapters + curated layout
7. **Posting app** — can start any time after Phase 2, since the Journal format is fixed by then
8. **Backfill** — ongoing: writing history, translating, adding books

Each section's room (color, signature control) is designed in that section's phase.

Highlight comes late on purpose. It is curation on top of data, so the data has to exist first.

## 10. Out of scope

Comments, likes, follows, analytics, newsletter, a web-based admin/CMS.
Maybe later: search, RSS feed, tags/places, book wishlist and ratings.

## 11. Questions

No open product questions. Design questions D1–D6 are tracked in §6.5.

### Resolved

| # | Answer |
|---|---|
| Q1 | Home page is Journal |
| Q2 | Talks become Projects (`type: talk`) and appear in About → Everything |
| Q3 | Highlight = `highlight: true` flags grouped into chapters |
| Q6 | Only `reading` / `finished` for now; no ratings |
| Q7 | Library = a small personal blurb with photo + link on the Books page |
| Q9 | A project's event is its launch / publish date (`date`, required) |
| Q11 | Phone posting via a small personal app (§7.6) |
| Q14 | Own domain: yes, buying later |
| Q4 | About → Everything reads oldest → newest |
| Q5 | Separate `/ko/` and `/en/` pages |
| Q8 | Projects default to Selected works |
| Q10 | GitHub Actions build running Astro (chosen over Jekyll / Hugo / Eleventy) |
| Q13 | Up to 6 photos per journal entry |
| Q15 | Photos start in the repo with swappable paths |
| Q16 | App form decided at Phase 7 (leaning PWA) |
| Q12 | Never shown: exact home location, mobile phone number |

## 12. Success criteria

- A journal entry (Korean, 1–3 photos) can be published in under 5 minutes, from a phone.
- Adding a book takes under 2 minutes.
- Every entry is readable as a plain text file without the site.
- Every entry exists in both languages, or clearly shows that it isn't translated yet.
- About → Everything lists every entry from all sections, with no manual upkeep.
- Moving photos to different storage, or the site to a different host, needs no edits to any entry.
