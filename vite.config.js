import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import yaml from '@rollup/plugin-yaml'

export default defineConfig({
  // Served from the root of the custom domain (design.bodyparts.xyz), not from
  // a /repo-name/ sub-path. If the custom domain is ever removed, this has to
  // go back to '/design.bodyparts.xyz/' or every asset URL 404s.
  base: '/',
  plugins: [react(), yaml()],
})
