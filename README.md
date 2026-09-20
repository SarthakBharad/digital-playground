<div align="center">

# Sarthak's Digital Playground

**One question a week, answered with data.**

A public practice log for web development and data analysis. Every week a random question goes out
on X, the answers get worked through in a Jupyter notebook, and the results land on the site as
interactive analytics — with the CSVs in this repo and the raw datasets on Kaggle.

[![Next.js](https://img.shields.io/badge/Next.js-16-000000?style=flat-square&logo=next.js&logoColor=white)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![pnpm](https://img.shields.io/badge/pnpm-10-F69220?style=flat-square&logo=pnpm&logoColor=white)](https://pnpm.io)
[![Python](https://img.shields.io/badge/Python-3.12-3776AB?style=flat-square&logo=python&logoColor=white)](https://www.python.org)
[![Licence: MIT](https://img.shields.io/badge/code-MIT-5E0006?style=flat-square)](LICENSE)
[![Data: CC BY 4.0](https://img.shields.io/badge/data-CC_BY_4.0-9B0F06?style=flat-square)](LICENSE-DATA)

</div>

---

## Two halves, one repo

| Folder | What it is |
| --- | --- |
| `src/`, `public/` | The **website** — Next.js 16, TypeScript, Tailwind v4. Reads each week's CSVs at build time and renders them as charts. |
| `data-analysis/` | The **notebooks** — Python, pandas, Jupyter. Turns raw answers into the tidy CSVs the site reads. |

The handoff between them is one folder: a notebook writes `public/data/week-NN/*.csv`, the site
picks it up on the next build. Nothing else is shared, and the site never runs Python.

## Highlights

| | |
| --- | --- |
| **CSV in, charts out** | Drop a notebook's CSVs into `public/data/week-NN/`, describe the charts in a typed week file, and every page prerenders from the real numbers. A missing file or a misspelt column fails the build with a message that says which. |
| **Hand-built chart kit** | Bar (horizontal + vertical), line (log scale, reference lines, crosshair) and donut charts in plain SVG/HTML — no chart library. Hover and keyboard tooltips, a chart ↔ table toggle, and a CSV download on every figure. |
| **Data explorer** | Every week's tables in one tabbed grid: filter, sort any column, page through, and download exactly the view you're looking at. |
| **A hero that's a chart** | A canvas "data field" sampled from a drifting surface; the cursor is a lens with a crosshair readout. Beside it, a Jupyter cell types `pd.read_csv(...)` against the latest week's real files. |
| **⌘K palette** | Jump to any week (search by title or tag), open the data links, flip the theme. `/` opens it too. |
| **Two real themes** | Oxblood night and sand paper — separate palettes from the same four brand colours, not an inversion. |
| **Reproducible analysis** | Raw answers are immutable; every fix lives in the notebook, so re-running it reproduces the published numbers exactly. |

## Getting started

### The website

```bash
pnpm install
pnpm dev          # → http://localhost:3000
```

| Script | Does |
| --- | --- |
| `pnpm dev` | Dev server |
| `pnpm build` | Production build (static — every route prerenders) |
| `pnpm start` | Serve the production build |
| `pnpm lint` / `pnpm typecheck` / `pnpm check` | ESLint, `tsc --noEmit`, both |
| `pnpm new-week <n> "<question>"` | Scaffold a new week |

Copy `.env.example` to `.env.local` and set `NEXT_PUBLIC_SITE_URL` once deployed.

**Before the first deploy:** open `src/lib/site.ts` and replace the two `TODO` links —
`data.github` (this repo) and `data.kaggle` (your Kaggle profile or dataset collection).

### The notebooks

From `data-analysis/`, on Windows PowerShell:

```powershell
py -m venv .venv
.\.venv\Scripts\Activate.ps1      # macOS/Linux: source .venv/bin/activate
python -m pip install --upgrade pip
pip install -r requirements.txt
```

In VS Code (with the *Python* and *Jupyter* extensions): open a notebook, click the kernel picker
→ **Select Another Kernel → Python Environments** → the `.venv` one.

Details and the per-week routine: [`data-analysis/README.md`](data-analysis/README.md).

## The weekly workflow

1. **Ask** on X, then scaffold the week:

   ```bash
   pnpm new-week 1 "What's the most overrated JavaScript framework?"
   ```

   This creates `src/content/weeks/week-01.ts` with `status: "collecting"`, an empty
   `public/data/week-01/`, and registers the week. Deploy — the site shows the question with a
   live "collecting answers" badge.

2. **Collect** the replies in a spreadsheet. Export to `data-analysis/data/week-0NN.csv`
   (LibreOffice: *File → Save a Copy → Text CSV*, UTF-8, comma-separated).

3. **Analyse** in `data-analysis/notebooks/week-0NN-analysis.ipynb`. The export cell writes the
   result tables to `data-analysis/outputs/results/` **and** to `public/data/week-NN/`, and saves
   figures to `data-analysis/outputs/figures/` for posting on X.

4. **Publish.** Fill in the week file from the notebook's summary:

   ```ts
   stats: [
     { label: "Replies", from: { csv: "top_songs.csv", column: "mentions", agg: "sum" } },
     { label: "Winner", value: "Tu Hi Meri Shab Hai" },
   ],
   charts: [
     { kind: "bar", id: "ranking", title: "Most-named songs", csv: "top_songs.csv",
       x: "song", y: "mentions", limit: 10, unit: "replies" },
     { kind: "donut", id: "first", title: "Who opened the list", csv: "first_choice.csv",
       label: "song", value: "first_picks" },
   ],
   findings: ["**Tu Hi Meri Shab Hai** was named by 47.5% of replies…"],
   methodology: ["Replies were collected from the thread on …"],
   ```

   Flip `status` to `"published"`, set `publishedOn`, add the `links`, push. Upload the raw file
   to Kaggle and paste that link in too.

`data-analysis/notebooks/week-001-analysis.ipynb` is a worked example end to end; the site also
ships with Week 00, a reproducible warm-up dataset (`scripts/week-00-warmup.py`) that exercises
every chart type. Delete either once real weeks pile up.

### Chart options at a glance

| Kind | Required | Optional |
| --- | --- | --- |
| `bar` | `x` (category), `y` (number) | `orientation`, `sort` (`desc` default), `limit`, `highlight`, `unit`, `format` |
| `line` | `x` (number or ISO date), `series[]` (≤ 4) | `reference`, `logX`, `xLabel`, `format` |
| `donut` | `label`, `value` | `maxSlices` (≤ 4, the rest fold into "Other"), `unit`, `format` |

All charts take `id`, `title`, `csv`, and optionally `caption` and `wide`.

## Design system

The playground is a sibling of [the portfolio](https://sarthakbharad.vercel.app), not a copy: same
structure (Array wordmark with the blinking caret, mono eyebrows, section indices, ⌘K, magnetic
buttons, scramble text), different job — the WebGL hero becomes a canvas chart, the photo becomes a
notebook, and the palette turns red.

### Palette

| | Hex | Role |
| --- | --- | --- |
| ![#5E0006](https://readme-swatches.vercel.app/5E0006?style=round) | `#5E0006` | Oxblood — the anchor; the ground in dark mode |
| ![#9B0F06](https://readme-swatches.vercel.app/9B0F06?style=round) | `#9B0F06` | Crimson — primary accent |
| ![#D53E0F](https://readme-swatches.vercel.app/D53E0F?style=round) | `#D53E0F` | Vermilion — fills, the "live" signal, chart series 1 |
| ![#EED9B9](https://readme-swatches.vercel.app/EED9B9?style=round) | `#EED9B9` | Sand — paper in light mode, type tint in dark |

Tokens live in `src/app/globals.css` and reach Tailwind through `@theme inline`
(`bg-surface`, `text-fg-muted`, `text-accent-2` …). Text tokens clear WCAG AA in both themes.

**Chart colours.** Four reds can't tell series apart — especially for colour-blind readers — so
charts use a fixed categorical order that starts on the brand vermilion and extends with a teal, an
ochre and a blue (`--chart-1…4`, separate light/dark steps). Both sets were validated for lightness
band, chroma, CVD separation (protan/deutan ΔE ≥ 11) and 3:1 contrast against the card surface.
Single-series charts only ever use slot 1. The notebook's matplotlib figures use the same hexes.

### Type

| Family | Used for | Class |
| --- | --- | --- |
| [Array](https://www.fontshare.com/fonts/array) | Wordmark, hero, week numbers | `font-display` |
| [Chillax](https://www.fontshare.com/fonts/chillax) | Headings | `font-heading` |
| [Supreme](https://www.fontshare.com/fonts/supreme) | Body and UI | `font-sans` |

A system monospace stack (`font-mono`) carries labels, code and numbers-in-columns.

## Structure

```
├─ data-analysis/           the notebook half
│  ├─ data/                 raw answers, one CSV per week (never edited by hand)
│  ├─ notebooks/            week-0NN-analysis.ipynb
│  ├─ outputs/
│  │  ├─ figures/           PNGs for posting on X
│  │  └─ results/           tidy tables the notebook produces
│  └─ requirements.txt
├─ public/data/week-NN/     the CSVs the site reads (also served for download)
├─ scripts/                 new-week scaffolder, week-00 data generator
└─ src/
   ├─ app/                  layout, home, /weeks, /weeks/[slug], 404, sitemap, robots, icon
   ├─ content/weeks/        one typed file per week + the registry
   ├─ components/
   │  ├─ charts/            BarChart, LineChart, DonutChart, ChartCard, DataExplorer
   │  ├─ home/              Hero, Archive, Latest / Loop / Open-data sections
   │  ├─ layout/            Navbar, Footer, CommandPalette, ThemeToggle, ScrollProgress
   │  ├─ ui/                Icon, Reveal, MagneticButton, ScrambleText, SectionHeader, …
   │  └─ visuals/           DataField (canvas hero), NotebookCell, Marquee
   └─ lib/                  weeks (build-time loader), csv, format, site, types
```

## Notes

- CSVs are parsed at build time and each chart's rows ship to the page, so keep published tables
  tidy and aggregated (thousands of rows is fine; hundreds of thousands belongs on Kaggle).
- Everything animated respects `prefers-reduced-motion`; the canvas pauses offscreen and in
  background tabs.
- The `.venv` lives in `data-analysis/` and is git-ignored — `requirements.txt` is what travels.

## Licence

- **Code** — MIT, see [LICENSE](LICENSE). Free to learn from, fork and reuse.
- **Data and write-ups** — CC BY 4.0, see [LICENSE-DATA](LICENSE-DATA). Reuse them anywhere, just
  credit the playground and link back.

Answers come from public replies on X and are published so the analysis can be checked. If you
replied and would rather not appear, message me and I'll remove you from the files and the results.