import { copyFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import yaml from '@rollup/plugin-yaml'

// GitHub Pages serves 404.html for any path it doesn't recognise. Because we use
// BrowserRouter (clean URLs, no #), a direct hit or refresh on e.g.
// /portfolio/poster asks GH for a file that isn't there. Shipping 404.html as a
// byte-for-byte copy of index.html means that request still boots the app, and
// React Router reads the URL and renders the right route.
function spaFallback() {
  return {
    name: 'spa-404-fallback',
    closeBundle() {
      const dist = resolve(__dirname, 'dist')
      copyFileSync(resolve(dist, 'index.html'), resolve(dist, '404.html'))
    },
  }
}

export default defineConfig({
  // Served from the root of the custom domain (design.bodyparts.xyz), not from
  // a /repo-name/ sub-path. If the custom domain is ever removed, this has to
  // go back to '/design.bodyparts.xyz/' or every asset URL 404s.
  base: '/',
  plugins: [react(), yaml(), spaFallback()],
})
