# JustAdev742.github.io

The Jovian Games studio site, served at [joviangame.me](https://joviangame.me/). It shows the studio's work: Jovian Engine, Cards Against The Humanity, the ARC-AGI-3 research, and the lab projects.

The project sites under the same domain (`/cards-against-the-humanity/`, `/Claude-AI-Games/voxel-odyssey/`, `/Trashbin-robot/`) deploy from their own repositories and are unaffected by this one.

## Stack

- **React 19** with Vite, prerendered at build time, so the full page is in the HTML before any JavaScript runs
- **Tailwind CSS 4** on a three-layer token system (`src/styles/index.css`)
- **Motion** for springs and scroll-linked motion, and React's `<ViewTransition>` for the sheet and the shared-image morph
- **WebGL** for the live gas giant in the hero (`src/components/hero/atmosphere.ts`)

The design decisions and tokens are written up in [DESIGN.md](DESIGN.md).

## Run it locally

You need Node 24.

```bash
npm install
npm run dev
```

The dev server runs at `http://localhost:5173`. To check the production build, including the prerendered HTML:

```bash
npm run build
npm run preview
```

## How the build works

`npm run build` type-checks, builds the client, builds a server renderer, and runs `scripts/prerender.mjs`, which writes:

- `dist/index.html`: the whole page as static HTML, which the client then hydrates
- the page's schema.org JSON-LD and `dist/llms.txt`, both generated from `src/content/`
- the build date into the sitemap and the footer's "Updated" line
- `dist/404.html`: a `noindex` page that sends visitors home

## Add a project

1. Put the screenshot in `media-src/`, add it to the `IMAGES` list in `scripts/media.mjs`, and run `npm run media`. That writes AVIF and WebP sizes to `public/media/` and regenerates `src/content/media.gen.ts`.
2. Add an entry to `src/content/projects.ts`.
3. Optionally, give it a schema.org type in `src/content/structured-data.ts`.

The project then appears in the index (⌘K / Ctrl K), the archive, its own detail sheet at `?project=<id>`, the structured data and `/llms.txt`.

## Fonts

The page preloads two small subsets, `public/fonts/archivo-core.woff2` and `martian-mono-core.woff2`, holding only the characters the site uses (about 40% smaller than the full latin files). The full files stay declared underneath them. Any other character, such as an accented name in a new project, still renders in the right font, because the browser downloads the full file when a page needs it.

Adding a character to the core subsets is optional: it only saves that download. To add one:

1. Install `fonttools` and `brotli` for Python.
2. Add the code point to the `unicode-range` of both core faces in `src/styles/index.css`.
3. Run the same range through `pyftsubset` for each font, for example:

```bash
pyftsubset public/fonts/archivo-latin.woff2 --unicodes="U+0020-007E,U+00A0,U+00A9,U+00B0,U+00B2,U+00B7,U+00D7,U+00F7,U+2013-2014,U+2019,U+201C-201D,U+2026,U+2191-2193,U+2197,U+2265" --layout-features='*' --flavor=woff2 --output-file=public/fonts/archivo-core.woff2
```

## Deploy

`.github/workflows/deploy.yml` builds and deploys to GitHub Pages on every push to `main`. It relies on one repository setting, already in place: **Settings → Pages → Build and deployment → Source: GitHub Actions**. The custom domain comes from `public/CNAME`.

## Licences

Archivo and Martian Mono are used under the SIL Open Font License (`public/fonts/`). Cards Against The Humanity is an unofficial fan project, not affiliated with Cards Against Humanity LLC; its card text is used under [CC BY-NC-SA 2.0](https://creativecommons.org/licenses/by-nc-sa/2.0/).
