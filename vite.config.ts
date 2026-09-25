import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// The site is the user page for JustAdev742, served from the domain root at
// https://joviangame.me/ — project pages live beside it under their repo names.
// The day of the build. The footer shows it; the structured data and the
// sitemap carry it as the page's last-modified date.
const buildDate = new Date().toISOString().slice(0, 10)

export default defineConfig({
  base: '/',
  define: {
    __BUILD_DATE__: JSON.stringify(buildDate),
  },
  plugins: [react(), tailwindcss()],
  build: {
    target: 'es2022',
    sourcemap: false,
  },
})
