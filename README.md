# Body Bits Website

Portfolio site for Body Parts / Body Bits. Built with React + Vite, deployed to GitHub Pages.

## Stack

- React 19, React Router
- Three.js / React Three Fiber — 3D model viewer
- XY Flow — mindmap diagrams per portfolio item
- CSS Modules + custom properties for all styling
- YAML for portfolio content

## Dev

```bash
npm install
npm run dev
```

## Deploy

```bash
npm run deploy
```

Builds and pushes to `gh-pages` branch via the `gh-pages` package.

## Adding a portfolio item

1. Drop the image into `public/portfolio/`
2. Create `src/data/items/my-item.yaml` — title, tags, date, nodes, edges
3. Create `src/data/layouts/my-item.js` — `{ x, y }` position for each node
4. Import both in `src/data/portfolio.js` and add a `buildItem()` call to the array

See existing files in `src/data/items/` and `src/data/layouts/` for examples.
