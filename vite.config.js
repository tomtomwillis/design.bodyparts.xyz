import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import yaml from '@rollup/plugin-yaml'

export default defineConfig({
  base: '/design.bodyparts.xyz/',
  plugins: [react(), yaml()],
})
