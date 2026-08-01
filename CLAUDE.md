# Body Bits Website — Project Rules

## File overview

| File | Purpose |
|---|---|
| `src/app.css` | Global reset, CSS custom properties (colours, fonts, spacing tokens) |
| `src/main.jsx` | React entry point, router setup |
| `src/App.jsx` | Root component, route definitions |
| `src/pages/Home/Home.jsx` | Home page layout — title + nav left, 3D model right |
| `src/pages/Home/Home.module.css` | Home layout styles, title position, mobile media query |
| `src/pages/Portfolio/Portfolio.jsx` | Portfolio grid page, category filter via URL param |
| `src/pages/Portfolio/Portfolio.module.css` | Portfolio page styles |
| `src/pages/Portfolio/PortfolioItem.jsx` | Single portfolio item card |
| `src/pages/About/About.jsx` | About page |
| `src/pages/BodyParts/BodyParts.jsx` | Body Parts page |
| `src/components/Navigation/Navigation.jsx` | Collapsible nav with Portfolio sub-menu |
| `src/components/Navigation/Navigation.module.css` | Nav styles, sub-menu animation |
| `src/components/ModelViewer/ModelViewer.jsx` | Three.js Canvas, camera setup, OrbitControls |
| `src/components/ModelViewer/ModelViewer.module.css` | Canvas container styles |
| `src/data/portfolio.js` | Combines AllPortfolio + PortfolioDetail files into `portfolioItems` array |
| `src/data/AllPortfolio.yaml` | All portfolio items' basic info (title, tags, date, page slug) |
| `src/data/PortfolioDetail/` | One `.yaml` per item — mindmap nodes (with x/y), edges, images |
| `public/model/` | 3D model file (.glb) |
| `public/portfolio/` | Portfolio item images |
| `public/fonts/` | Custom font files |


## Design tokens
All colours and fonts must be defined as CSS custom properties in `body-bits/src/app.css`.
Never hardcode a colour value or font-family string inside a component file or CSS module — always reference a `var(--...)` token.

## Portfolio items
To add a new item:
1. Drop the image into `public/portfolio/`
2. Add an entry to `src/data/AllPortfolio.yaml` with `title`, `tags`, `date` (DD.MM.YY), and `page` (a slug matching the filename below)
3. Create `src/data/PortfolioDetail/my-item.yaml` — list nodes with `id`, `type`, `label`, optional `image`, and `x`/`y` position; list edges as pairs `- [source-id, target-id]`

Items display in newest-first date order. `portfolio.js` picks up new PortfolioDetail files automatically — no edits needed there.
No new component files are needed per item.

### External links
An item can carry an optional `links` list. Each entry renders as its own button in the item's
expanded row, styled like the Gallery button, opening in a new tab:

```yaml
  links:
    - label: Live Site
      url: https://example.com
    - label: Instagram
      url: https://instagram.com/example
```

`label` is the button text and `url` is the destination — both are required per entry. Omit `links`
entirely for items that don't need any.

## Git / GitHub
Never add Claude as a co-author or contributor in git commits or on GitHub.

## Component structure
- One component per folder: `ComponentName/ComponentName.jsx` + `ComponentName.module.css`
- Pages live in `src/pages/`, reusable UI in `src/components/`
- Keep components small — if a component exceeds ~100 lines, split it

## 3D model
The model file lives in `public/model/`. ModelViewer loads it via `useGLTF`.
If the model file name changes, update the path in `src/components/ModelViewer/ModelViewer.jsx` only.
