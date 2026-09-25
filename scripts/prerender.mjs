// Renders the page to static HTML after `vite build`, so the first paint,
// search engines and AI crawlers all get the full content without running
// any JavaScript. The client then hydrates the same markup.
//
//   vite build                                  -> dist/ (client)
//   vite build --ssr src/entry-server.tsx       -> dist-ssr/ (server renderer)
//   node scripts/prerender.mjs                  -> dist/index.html with content, dist/404.html

import { readFile, writeFile, rm } from 'node:fs/promises'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { dirname, join } from 'node:path'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const dist = join(root, 'dist')
const ssrEntry = join(root, 'dist-ssr', 'entry-server.js')

const { render, structuredData, llmsText, BUILD_DATE } = await import(pathToFileURL(ssrEntry).href)
const template = await readFile(join(dist, 'index.html'), 'utf8')
const marker = '<!--app-html-->'
const dataMarker = '<!--structured-data-->'
for (const m of [marker, dataMarker]) if (!template.includes(m)) throw new Error(`dist/index.html is missing ${m}`)

// "<" is escaped so no string in the data can close the script element early.
const jsonLd = `<script type="application/ld+json">${JSON.stringify(structuredData()).replace(/</g, '\\u003c')}</script>`
const html = render()
await writeFile(join(dist, 'index.html'), template.replace(marker, html).replace(dataMarker, jsonLd))

// A plain-text brief for language models, from the same content.
await writeFile(join(dist, 'llms.txt'), llmsText())

// The sitemap's home entry carries the build date, like the structured data.
const sitemapFile = join(dist, 'sitemap.xml')
const sitemap = await readFile(sitemapFile, 'utf8')
await writeFile(sitemapFile, sitemap.replace(/<lastmod>[^<]*<\/lastmod>/, `<lastmod>${BUILD_DATE}</lastmod>`))

// GitHub Pages serves 404.html for unknown paths. Send those visitors home with
// a short, honest page rather than a blank one; project sites under the domain
// (/cards-against-the-humanity/ and others) are unaffected.
const notFound = template
  .replace(marker, '')
  .replace(dataMarker, '')
  .replace(/<link rel="canonical"[^>]*>/, '<meta name="robots" content="noindex" />')
  .replace(/<title>[^<]*<\/title>/, '<title>Jovian Games: page not found</title>')
  .replace(/<script type="module"[^>]*><\/script>/, '')
  .replace(
    '<div id="root"></div>',
    `<main id="root" style="min-height:100dvh;display:grid;place-items:center;padding:2rem;font-family:var(--font-sans);color:var(--fg);background:var(--canvas)">
      <div style="max-width:32rem">
        <p style="font:500 .75rem/1.4 var(--font-mono);letter-spacing:.08em;text-transform:uppercase;color:var(--fg-subtle)">404</p>
        <h1 style="margin:.75rem 0 1rem;font-size:clamp(2rem,6vw,3.5rem);line-height:1;letter-spacing:-.03em">Nothing orbits here.</h1>
        <p style="color:var(--fg-muted);line-height:1.5">This page doesn’t exist, or it moved. Everything Jovian Games makes is on the home page.</p>
        <p style="margin-top:2rem"><a href="/" style="display:inline-flex;align-items:center;height:3rem;padding:0 1.25rem;border-radius:3px;background:var(--btn-primary-bg);color:var(--btn-primary-fg);font-weight:600;text-decoration:none">Go to joviangame.me</a></p>
      </div>
    </main>`,
  )
await writeFile(join(dist, '404.html'), notFound)

await rm(join(root, 'dist-ssr'), { recursive: true, force: true })
console.log(`prerendered ${(html.length / 1024).toFixed(0)} kB of HTML into dist/index.html, wrote dist/404.html`)
