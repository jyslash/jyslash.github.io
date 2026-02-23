# CLAUDE.md

This file provides guidance for AI assistants working in this repository.

## Project Overview

**helloworld** is an early-stage static homepage project. The repository is currently in the planning/exploration phase. The README outlines three candidate implementation paths:

1. **GitHub + Jekyll** — Static site generation using Jekyll, hosted via GitHub Pages.
2. **Markdown + Eleventy + Deploy** — Static site generation using Eleventy (11ty), authored in Markdown, deployed to a hosting provider.
3. **Framer** — No-code/low-code visual website builder.

No implementation has been chosen or started yet.

## Repository Structure

```
helloworld/
├── README.md       # Project overview and technology options
└── CLAUDE.md       # This file
```

## Current State

- No source code, build system, or dependencies exist yet.
- The project is pre-implementation: the team is evaluating static site options.
- There are no tests, CI/CD pipelines, or configuration files.

## Development Guidance

### When Implementation Begins

Depending on which path is chosen, expect the following conventions:

#### Option 1: GitHub + Jekyll
- Language: Ruby-flavored Liquid templates + Markdown
- Build: `bundle exec jekyll serve` (local), `bundle exec jekyll build` (production)
- Config: `_config.yml`
- Content: `_posts/`, `_pages/`
- Dependencies: `Gemfile` / `Gemfile.lock`

#### Option 2: Markdown + Eleventy
- Language: JavaScript/Node.js + Markdown (Nunjucks or Liquid templates)
- Build: `npx @11ty/eleventy` or `npm run build`
- Dev server: `npx @11ty/eleventy --serve`
- Config: `.eleventy.js` or `eleventy.config.js`
- Dependencies: `package.json` / `package-lock.json`
- Content lives in Markdown files at the project root or a `src/` directory

#### Option 3: Framer
- Managed entirely within the Framer web app; no local code to build or test.
- Any exported code will be React-based.

### General Conventions to Follow

- Keep commits small and focused with clear messages.
- Do not add files, dependencies, or configuration that hasn't been agreed upon.
- Update this CLAUDE.md whenever the chosen technology stack is finalized.
- Update README.md to reflect the final choice and remove the options list once decided.

## Git Workflow

- The default branch is `master`.
- Feature work is done on branches prefixed with `claude/` or named after the feature.
- Open a pull request against `master` for review before merging.

## Notes for AI Assistants

- This repository has no runnable code yet. Do not attempt to run builds or tests.
- Before adding any files, confirm the chosen implementation path with the user.
- When the stack is decided, update this file with accurate build commands, test commands, and project structure details.
