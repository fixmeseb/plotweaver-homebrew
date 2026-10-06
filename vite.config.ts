import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  // Served from https://fixmeseb.github.io/plotweaver-homebrew/ on GitHub Pages.
  base: '/plotweaver-homebrew/',
  plugins: [react()],
})
