# CS460 Summer 2026 — Lab Website

Static site for the CS460 lab materials. Plain HTML/CSS/JS, no build step, no frameworks.

## File Structure

```
.
├── index.html        Home / Lab Hub
├── lab-1.html        Lab 1 page
├── lab-2.html        Lab 2 page
├── lab-3.html        Lab 3 page
├── lab-4.html        Lab 4 page
├── lab-5.html        Lab 5 page
├── lab-6.html        Lab 6 page
├── styles.css        All styling (uses CSS variables — easy to retheme)
├── script.js         Lab dropdown + TOC scroll-spy
└── favicon.svg       Browser tab icon
```

## Common Maintenance Tasks

### Fill in a lab's content

Open `lab-N.html`. Find the four `<section>` blocks inside the `<div class="lab-content">`. Each section has this shape:

```html
<section id="overview" class="lab-section">
  <h2 class="section-title">1. Overview</h2>
  <div class="section-body">
    <p class="placeholder"><em>Content for this section will be added soon.</em></p>
  </div>
</section>
```

Replace the placeholder `<p>` with real content. You can use any standard HTML inside `.section-body`: paragraphs (`<p>`), bullet lists (`<ul><li>...</li></ul>`), subheadings (`<h3>`), inline code (`<code>...</code>`), and block code:

```html
<pre><code class="language-sql">SELECT * FROM students WHERE gpa > 3.5;</code></pre>
```

The `language-sql` class triggers syntax highlighting via Prism.js.

To rename a section, change both the `<h2>` text **and** the `id` on the `<section>`, then update the matching link in the TOC sidebar (the `<aside class="toc">` block) and the mobile TOC (the `<details class="toc-mobile">` block) so the anchor links still work.

### Set the lab topic name

Each lab page hero currently reads `Lab N: [Topic TBD]`. Change the `[Topic TBD]` part to the actual topic, e.g., `Lab 1: Review` or `Lab 3: Joins and Aggregation`. Do this in two places:

- `<title>` in the `<head>` (browser tab)
- `<h1 class="hero__title">` (hero banner)

Then on `index.html`, find the matching `<span class="lab-list__title">[Topic TBD]</span>` in the hub list and replace it with the topic name (no need to include "Lab N:" — the row already shows the number).

### Flip a lab from "Coming soon" to "Released"

In `index.html`, find the lab's row in the `<ol class="lab-list">` and change:

```html
<span class="pill pill--coming">Coming soon</span>
```

to:

```html
<span class="pill pill--released">Released</span>
```

That's it. The styling is already defined.

### Add a 7th (or later) lab

1. Duplicate `lab-6.html` and rename it `lab-7.html`.
2. In the new file, change all occurrences of `Lab 6` to `Lab 7` (title, description, hero, og:title).
3. In `index.html`, copy one of the existing `<li class="lab-list__item">` rows in the `<ol class="lab-list">` and update the link, number (`07`), and title.
4. In **all** HTML files (every page that contains the nav), add `<a href="lab-7.html" role="menuitem">Lab 7</a>` to the `<div class="nav__panel" role="menu">` inside the Lab dropdown.

(Step 4 is the one tedious part — the nav lives in every file. A more maintainable long-term option is to extract the nav into a small JS include, but that's overkill for a 6-lab site.)

### Change the term across the whole site

The string `CS460 Summer 2026` appears in: the `<title>` and `<meta>` tags, the nav title (`.nav__title--long`), the short nav title (`.nav__title--short`), and the footer. Find-and-replace across all HTML files to update it for a future term.

### Update the TA name in the footer

In every HTML file, find `[TA Name]` in the footer block and replace with the actual name.

## Hosting on GitHub Pages

1. Create a new public repo on GitHub. A clean name like `cs460-summer-2026` works well — it becomes part of the URL.
2. Add all the files in this folder to the repo (drag and drop in the GitHub web UI, or `git push` from local if you prefer the command line).
3. Go to **Settings → Pages** in the repo.
4. Under **Source**, select **Deploy from a branch**, choose `main` branch and `/ (root)` folder, then click **Save**.
5. Wait ~1 minute. The site goes live at `https://<your-github-username>.github.io/cs460-summer-2026/`.

To update content later: edit the files in the GitHub web UI (click any file → pencil icon → edit → "Commit changes") and the site rebuilds automatically within a minute or two. No terminal needed.

### Optional: custom URL

If BU gives you a subdomain or you want to use `cs-people.bu.edu/~yourusername/cs460/`, you can either (a) point a custom domain at the GitHub Pages site via the **Custom domain** field in Settings → Pages, or (b) skip GitHub Pages entirely and `scp` the folder up to BU's hosting.

## Design System Cheat Sheet

All colors, fonts, and spacing are defined as CSS variables at the top of `styles.css` inside `:root { ... }`. To retheme the site, edit those variables once and every component updates. Key variables:

- `--color-brick` — main hero red
- `--color-accent` — bright red-orange for section titles and links
- `--font-display` — hero font (Big Shoulders Display)
- `--font-body` — UI/body font (Manrope)
- `--font-mono` — code font (JetBrains Mono)

Fonts are loaded from Google Fonts via a `<link>` in each HTML file's `<head>`. Internet is required to load them; without it, the browser falls back to system fonts and the site still works (just looks less distinctive).

## Browser Support

Tested mental model: anything that supports CSS custom properties, `<details>`/`<summary>`, IntersectionObserver, and CSS Grid. That's every browser from ~2019 onward (Chrome, Firefox, Safari, Edge — all current versions). No IE support.
