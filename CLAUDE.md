# CLAUDE.md

This file provides guidance for AI assistants working in this repository.

## Project Overview

**helloworld** is a personal static homepage built with **Jekyll**, hosted on **GitHub Pages**.

## Stack

- **Generator:** Jekyll (via `github-pages` gem)
- **Theme:** Minima
- **Hosting:** GitHub Pages (auto-builds on push to `master`)

## Repository Structure

```
helloworld/
├── _posts/              # Blog posts — filename format: YYYY-MM-DD-title.md
├── _config.yml          # Site-wide settings (title, description, theme, etc.)
├── index.md             # Homepage content
├── Gemfile              # Ruby gem dependencies
├── .gitignore           # Excludes _site/, .bundle/, vendor/
├── README.md            # Project overview and writing guide
└── CLAUDE.md            # This file
```

## Build Commands

- Local dev: `bundle exec jekyll serve` → visit http://localhost:4000
- Production build: `bundle exec jekyll build` → outputs to `_site/`
- Install deps: `bundle install`

> Note: Do not attempt to run builds in this environment — no Ruby/bundler installed.

## Development Guidance

- **Posts** go in `_posts/` with filename `YYYY-MM-DD-title.md`
- Each post needs front matter: `layout`, `title`, `date`
- **Site settings** (title, description, URL) are in `_config.yml`
- The `minima` theme provides all layouts — no need to create `_layouts/` unless customizing
- To customize styles, create `assets/css/style.scss` with `@import "minima"`

## Git Workflow

- **Solo project** — push directly to `master`, no PRs needed
- Always run `git status` before committing to review what's dirty
- Stage selectively when unrelated files are modified (e.g. don't include Obsidian workspace files or post edits in a UI fix commit)
- `.DS_Store` is gitignored — never stage it
- Local dev server: `bundle exec jekyll serve` → http://localhost:4000
