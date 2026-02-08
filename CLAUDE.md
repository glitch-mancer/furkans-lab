# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Structure

This repo contains two independent projects side by side:

- **`furkans-lab/`** — Bilingual (TR/EN) personal portfolio & blog site for an electronics/software engineer.
- **`playground/`** — A separate product/landing-page project. Design inspired by Google Antigravity (original reference kept in `playground/legacy/`).

## furkans-lab

### Build & Deploy

```bash
cd furkans-lab
npm ci            # install dependencies
npm run build     # runs node scripts/build.mjs → outputs to dist/
```

Deployment: GitHub Actions (`.github/workflows/deploy.yml`) runs `npm ci && npm run build` on push to `main`, then deploys the `dist/` folder to GitHub Pages. Node 20.

### Architecture

**Custom static site generator** (no framework). `scripts/build.mjs`:

1. Reads Markdown blog posts from `content/blog/*.md`, parses frontmatter with `gray-matter` and body with `marked`
2. Copies the six root HTML pages (`index.html`, `projeler.html`, `blog.html`, `hakkimizda.html`, `cv.html`, `iletisim.html`) into `dist/`, injecting generated blog card HTML:
   - `blog.html`: replaces `<!-- BLOG_POSTS -->` with all post cards
   - `index.html`: replaces `<!-- LATEST_POSTS -->` with the 2 most recent post cards
3. Renders each blog post into `dist/blog/{slug}/index.html` using `templates/post.html` as the template (placeholders like `{{title_tr}}`, `{{content_en}}`, etc.)
4. Copies `styles.css`, `script.js`, `assets/`, and `admin/` into `dist/`

### Bilingual Content Pattern

All user-facing text uses inline TR/EN spans: `<span class="tr">Turkish</span><span class="en">English</span>`. CSS rules (`html[data-lang="tr"] .en { display: none }`) toggle visibility. `script.js` manages the `data-lang` attribute on `<html>` and persists the choice in `localStorage`.

### Blog Post Frontmatter

Posts in `content/blog/*.md` use these fields: `title_tr`, `title_en`, `slug`, `date`, `excerpt_tr`, `excerpt_en`, `cover`, `tags`, `body_tr`, `body_en`. English fields are optional and fall back to Turkish.

### CMS

Decap CMS (formerly Netlify CMS) configured in `admin/config.yml` and `admin/index.html` for browser-based blog editing via git-gateway.

## playground

Static site (no build step, no dependencies). Pages: `index.html` (landing) and `contact.html`.

### Bilingual Pattern

Uses a `data-i18n` attribute approach. All translatable elements have `data-i18n="key"` attributes. Translations are stored as a JS dictionary object in `site.js` (keys for `en` and `tr`). Language preference persisted in `localStorage` under `playground-lang`.

### Features in `site.js`

Typed text animation, canvas particle background, mouse-parallax on hero visual, nav dropdown handling, header scroll effect, contact form stub. All animations respect `prefers-reduced-motion`.

### `legacy/` subdirectory

Contains the original Google Antigravity site files used as a design reference. Not part of the active project.
