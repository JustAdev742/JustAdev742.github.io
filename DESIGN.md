# Jovian Games design system

The decisions behind joviangame.me, each with its reason, so the next project
added to the site looks like it was always there.

## Concept: the instrument and the atmosphere

*Jovian* means "of Jupiter": the largest planet, banded, stormy, heavy enough
to hold 95 moons in orbit. The site uses two materials and nothing else:

- **The instrument**: near-black canvas, hairline rules, monospaced labels,
  a strict 12-column grid. Calm and exact. This is the studio.
- **The atmosphere**: the work itself, in real screenshots, real renders and
  one procedural gas giant rendered live in WebGL. Warm and alive.

Precision framing turbulence gives the tone the brief asks for: technical
and experimental, minimal and alive, confident and slightly mysterious.

Alternatives considered and rejected:

| Direction | Why not |
| --- | --- |
| Neon HUD / sci-fi FUI (cyan on black) | The most common "futuristic" look, and the look of the old CodeNova page. |
| Light editorial (cream paper, serif) | Undersells the engine and research work; screenshots are mostly dark. |
| Bento grid of rounded cards | The brief bans repeated card grids; every project would look the same. |

## Colour

Warm blacks, not blue ones: Jupiter's palette is cream, ochre and rust, and a
warm canvas separates the studio from the default cool-slate dark mode.

| Token | Value | Use | Contrast on canvas |
| --- | --- | --- | --- |
| `--canvas` | `#0B0A08` | page background | — |
| `--fg` | `#F2ECE2` | primary text | 16.8:1 |
| `--fg-muted` | `#ABA398` | secondary text | 7.9:1 |
| `--fg-subtle` | `#8C857B` | labels, captions | 5.4:1 |
| `--fg-faint` | `#6F6961` | decorative ticks only, never text | 3.6:1 |
| `--accent` (storm) | `#FF7438` | the one sharp accent: focus, live dots, key marks | 7.4:1 |

Accents are named after Jupiter and its moons: **storm** (the Great Red
Spot) for the studio, **europa** `#8FD3F4` for research, **band** ochres for
the atmosphere. Each featured project borrows its own world: the Cards
section uses the game's own tokens (ink `#000`, card `#1A1817`, paper
`#FFF`), and the research section cools the canvas to `#070A0D`. The page
background shifts between them as you scroll, so each project keeps its own
identity inside one system.

## Type

Two families, each with one job (Butterick: never more than two).

- **Archivo** (variable, width 62–125, weight 100–900): everything you read.
  Display type uses the expanded width (125) in short, letterspaced caps: wide
  like the planet's bands. Body text uses normal width.
  Archivo is also the Cards game's typeface, so the studio and its flagship
  web game share a voice.
- **Martian Mono** (variable width): labels, data, specs, code. Condensed to
  87.5% width, uppercase, +0.08em tracking.

Scale (fluid, `clamp`): hero 2.5→13.5rem, capped at 22svh (18svh on screens
under 30rem tall) so a landscape phone or 200% zoom still shows the tagline
and both actions · display 2.75→7rem ·
h2 2→3.75rem · h3 1.25→1.625rem · lead 1.125→1.375rem · body 1→1.0625rem ·
small 0.875rem · label 0.75rem. Tracking tightens as size grows; caps are
always letterspaced. Body line length stays under 65ch.

## Space and grid

- 4px base unit; Tailwind's spacing scale.
- 12 columns; gutter `clamp(1rem, 1.6vw + 0.6rem, 2rem)`; page margin
  `clamp(1rem, 3.6vw + 0.25rem, 3.5rem)`; content max 1440px.
- Section rhythm `clamp(6rem, 8vw + 4rem, 12rem)`.
- Breakpoints: <768 single column; 768–1023 two columns, no pinned
  scrolling; ≥1024 full compositions and the pinned engine story.

## Shape

Radius is rare and small: 3px on buttons and media frames, full round only
on status dots. Depth comes from hairlines and background shifts, not
shadows. No glassmorphism; the header uses an opaque-enough fill so text
stays legible.

## Motion

Every animation has a job: orient (section reveals), connect (the archive
preview landing in the project sheet), explain (the engine and agent
stories), or respond (press, hover).

| Token | Value | Use |
| --- | --- | --- |
| `--ease-out` | `cubic-bezier(0.23, 1, 0.32, 1)` | entrances, UI response |
| `--ease-in-out` | `cubic-bezier(0.77, 0, 0.175, 1)` | on-screen movement |
| press | 120ms | `scale(0.97)` on `:active` |
| hover | 180ms | colour, underline, arrow nudge |
| UI | 240ms | overlays fade in from the first frame; tab switches stay under 300ms |
| sheet | 460ms, `--ease-drawer` | the sheet slide and the shared-image morph |
| reveal | 900ms | one-time scroll reveals only; staggers 60–70ms |
| spring | `bounce 0` | the engine story (0.9s, explanatory) and the archive preview |

Rules: never animate what the keyboard opens (the index opens instantly);
exits are faster than entrances; hover effects only on fine pointers; ambient
motion is slow, pausable, and stops off-screen. Every dialog shares one scrim
(`modal-scrim`), so going from the index to a sheet never flashes the page.
View transitions are scoped by type: archive rows animate for filter changes
only. `prefers-reduced-motion` swaps every movement for a short cross-fade,
keeps the header in place, and renders a still frame of the atmosphere.

## Every screen, every engine

Effects have an equivalent wherever their trigger doesn't exist:

- **Touch screens**: archive rows carry their own thumbnail (the cursor preview needs a mouse), and it grows into the sheet when the row opens; The Settling's echo plays once the tile is in view instead of on hover.
- **Small screens**: the engine story isn't pinned, so each step makes the stage's camera move itself, from the whole editor to its region, as it scrolls into view.
- **Browsers without typed view transitions** (Chromium before 125, Safari before 18.2, Firefox before 144): the sheet and its scrim still animate in, with plain CSS.
- **WebKit** (Safari, and every browser on iOS): a closing sheet's picture doesn't morph back into the page, because that crashed WebKit in testing. The sheet still slides out.
- **The planet**: compiles its shader without blocking the page and lowers its own resolution if a GPU can't hold 30 fps. On a software renderer it draws a single still frame, and it rebuilds itself if the GPU drops its context.

## Accessibility

WCAG 2.2 AA, checked with AccessLint and by hand. The parts a scanner can't
see are decisions too:

- **Shortcuts**: ⌘K / Ctrl K only; no single-key shortcuts (2.1.4). Off while
  a project sheet is open, so dialogs never stack.
- **Hover content**: the archive preview is dismissed with Escape and never
  covers the focused row (1.4.13, 2.4.11).
- **Windows high contrast**: selected states (filters, tabs, index options)
  switch to `Highlight`; the active section and story step are underlined;
  shapes that relied on fills get outlines.
- **Text spacing**: nothing clips with WCAG text-spacing overrides; the footer
  address is sized to its container and may wrap after the dot.
- **No JavaScript, or a slow one**: content is visible by default. If the app
  hasn't booted after 4 s, the page drops back to its no-JS rendering.

## Components

| Component | Variants | Notes |
| --- | --- | --- |
| `Button` | `primary` (cream fill), `secondary` (hairline) | 48px tall, external links get ↗ and "opens in a new tab" |
| `TextLink` | inline | 1px underline, 3px offset |
| `Label` | — | mono caps; used for eyebrows, specs, captions |
| `Frame` | — | media with corner ticks, placeholder blur, clip-path reveal |
| `Section` | per-theme | sets the page background as it enters |

## Adding a project

1. Put the image in `media-src/`, add it to `scripts/media.mjs`, run `npm run media`.
2. Add an entry to `src/content/projects.ts`.

It appears in the index (⌘K), the archive, its detail sheet, the page's
structured data and `/llms.txt` automatically. Give it a schema.org type in
`src/content/structured-data.ts` (otherwise it is a `CreativeWork`).
Featured projects also get a hand-built section in `src/sections/`.
