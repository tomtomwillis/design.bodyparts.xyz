# Body Bits Website

Portfolio site for Body Parts / Body Bits — [design.bodyparts.xyz](https://design.bodyparts.xyz).
React + Vite, content authored in YAML, deployed to GitHub Pages.

## Stack

- **React 19** + **React Router 7** — routes defined in [App.jsx](src/App.jsx)
- **Three.js / React Three Fiber** — spinning 3D model on the home page
- **XY Flow** — pannable "Behind The Scenes" mindmap per portfolio item
- **CSS Modules** + custom properties — no CSS framework, all tokens in [app.css](src/app.css)
- **YAML** for all portfolio content, loaded at build time by `@rollup/plugin-yaml`

## Getting started

```bash
npm install
npm run dev
```

| Script | Does |
|---|---|
| `npm run dev` | Vite dev server |
| `npm run build` | Production build into `dist/` |
| `npm run preview` | Serve the built output locally |
| `npm run lint` | ESLint over the repo |
| `npm run webp` | Convert/downsize portfolio images (see below) |
| `npm run video` | Convert/compress portfolio videos (see below) |

> There is no `deploy` script — pushing to `main` deploys. See [Deploy](#deploy).

> The site is served from the root of the custom domain (`base: '/'` in [vite.config.js](vite.config.js)).
> Anything under `public/` is referenced through `import.meta.env.BASE_URL` — `portfolio.js`
> and the mindmap nodes already do this, so YAML paths are written plain, e.g. `/portfolio/Foo/bar.webp`.
> That indirection is what makes the base path a one-line change if the domain ever goes away.

## Layout

```
src/
  App.jsx                  route table
  app.css                  @font-face, design tokens, global reset
  pages/
    Home/                  title + nav left, 3D model right
    About/  BodyParts/
    Portfolio/             filterable list + drag-resizable image preview
      PortfolioItem.jsx    one row; expands to description + Gallery / BTS buttons
      MindMap/             /portfolio/:slug — XY Flow canvas with momentum panning
  components/
    Navigation/            collapsible nav with Portfolio sub-menu
    ModelViewer/           R3F canvas, loads public/model/mace.glb
    GalleryModal/          full-screen image/video lightbox
  data/
    AllPortfolio.yaml      every item's title, tags, date, hero, gallery, description
    PortfolioDetail/*.yaml optional mindmap for an item (nodes + edges)
    portfolio.js           merges the two into the `portfolioItems` array
public/
  portfolio/  model/  fonts/  Title.svg  favicon.svg  icons.svg
scripts/
  convert-to-webp.sh
  convert-video.sh
```

### How the data layer works

[portfolio.js](src/data/portfolio.js) reads `AllPortfolio.yaml`, sorts newest-first by
`date`, and for each entry looks for `PortfolioDetail/<page>.yaml` via `import.meta.glob`.
New detail files are picked up automatically — never edit `portfolio.js` to add an item.

## Adding a portfolio item

1. Drop the images into `public/portfolio/<ItemFolder>/` and run `npm run webp`
   (and `npm run video` if the item has video).
2. Add an entry to [AllPortfolio.yaml](src/data/AllPortfolio.yaml):

   ```yaml
   - title: Suzio - The Final Dance @ Colour Factory London
     tags: [poster, 3d, video, club]     # drives the category filter
     date: '18.05.26'                    # DD.MM.YY — sorts the list
     page: Suzio0526                     # optional; slug of the detail file
     hero: /portfolio/SuzioMay26/Still.webp
     gallery:
       - /portfolio/SuzioMay26/Still.webp
       - /portfolio/SuzioMay26/A3.webp
     description: 'Poster and video for Suzio, a club night in London.'
   ```

   `hero` is what the preview panel shows on hover. `gallery` enables the **Gallery**
   button (images *and* `.mp4/.webm/.ogg/.mov` are supported). Omit `page` and the item
   simply has no **Behind The Scenes** page.

3. *(Optional)* Add the mindmap at `src/data/PortfolioDetail/<page>.yaml`:

   ```yaml
   nodes:
     - id: hero
       type: hero              # 'hero' or 'detail'
       label: ''
       image: /portfolio/SuzioMay26/Still.webp
       x: 0
       y: 0
       width: 200              # optional, px
     - id: detail-1
       type: detail
       label: Process sketch
       x: 420
       y: -160

   edges:
     - [hero, detail-1]        # [source-id, target-id]
   ```

   Positions are manual — there's no auto-layout.

### Categories

Filter tabs live in `MAIN_CATEGORIES` / `MORE_CATEGORIES` in
[Portfolio.jsx](src/pages/Portfolio/Portfolio.jsx#L10-L11). Adding a new one means adding
it there *and* adding a `/portfolio/<cat>` route in [App.jsx](src/App.jsx) — otherwise the
slug falls through to the mindmap route.

## Images

```bash
npm run webp     # requires: brew install webp   (macOS only — uses sips)
```

Converts every `.png/.jpg/.jpeg/.tiff` under `public/portfolio/` to WebP at quality 85, and
downsizes anything whose long edge exceeds 2200px (2× the 1100px gallery modal, for retina).
Originals — and any WebP shrunk in place — are copied to `public/portfolio/tobedeleted/`,
mirroring their subfolder. Review, then delete that folder.

## Video

```bash
npm run video    # requires: brew install ffmpeg
```

Standardises everything under `public/portfolio/` to web-friendly H.264 MP4 — `yuv420p` for
broad browser support, AAC 128k audio, and `-movflags +faststart` so playback can begin
before the whole file downloads. Two passes:

1. **Convert** every `.mov/.webm/.avi/.m4v/.mkv` to `.mp4`.
2. **Re-encode** existing `.mp4`s *in place*, but only if they need it — long edge over
   1280px, or average bitrate over 4 Mbps.

Knobs are the constants at the top of [convert-video.sh](scripts/convert-video.sh):
`MAX_DIMENSION` (1280), `MAX_BITRATE` (4 Mbps), `CRF` (23 — lower is better/bigger), and
`PRESET` (`slow`). CRF holds quality constant and lets the bitrate fall wherever the content
allows, so re-running on already-processed files is a no-op.

Originals — and any MP4 re-encoded in place — are copied to `public/portfolio/tobedeleted/`
the same way `npm run webp` does it. Review, then delete that folder.

## Conventions

- **One component per folder**: `ComponentName/ComponentName.jsx` + `ComponentName.module.css`.
  Pages in `src/pages/`, reusable UI in `src/components/`. Split anything over ~100 lines.
- **No hardcoded colours or font stacks.** Every colour and font is a custom property in
  [app.css](src/app.css); components reference `var(--...)`.
- **Model path** is set in one place — the `modelPath` default in
  [ModelViewer.jsx](src/components/ModelViewer/ModelViewer.jsx#L18).

## Deploy

**Push to `main`.** [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) builds the
site and publishes it to GitHub Pages; there's nothing to run locally. You can also trigger it
by hand from the repo's **Actions** tab (*Deploy to GitHub Pages* → *Run workflow*).

Two settings make this work, and both are one-time:

- **Settings → Pages → Source** must be **GitHub Actions** (not "Deploy from a branch").
- **Settings → Pages → Custom domain** is `design.bodyparts.xyz`, with **Enforce HTTPS** ticked.

DNS lives at whoever registers `bodyparts.xyz` — a single `CNAME` record for the `design`
subdomain pointing at `tomtomwillis.github.io.` (DNS-only; if it's on Cloudflare, keep the
proxy **off**, or GitHub can't provision the HTTPS cert).

### Clean URLs

The app uses `BrowserRouter`, so routes have no `#` (`/portfolio/poster`, not `/#/portfolio/poster`).
GitHub Pages has no server to route those deep links, so the `spaFallback` plugin in
[vite.config.js](vite.config.js) copies `index.html` to `404.html` at build time — a direct hit
or refresh on any route falls through to `404.html`, which boots the app and lets React Router
resolve the URL. (GitHub returns a 404 status on those requests even though the page renders
correctly; harmless for this site.)

[`public/CNAME`](public/CNAME) is copied into every build so the custom domain survives
each deploy. **Don't delete it** — without it GitHub can drop the domain back to
`tomtomwillis.github.io/design.bodyparts.xyz/`, which the `base: '/'` build won't work under.
