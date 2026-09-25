// Site-wide constants. Every outbound link lives here or in projects.ts, so a
// moved URL is a one-line change.

export const SITE_URL = 'https://joviangame.me/'

/** The day this build was made, as YYYY-MM-DD (stamped in by vite.config.ts). */
export const BUILD_DATE: string = __BUILD_DATE__

export const links = {
  home: SITE_URL,
  github: 'https://github.com/JustAdev742',
  engineRepo: 'https://github.com/JustAdev742/Jovian-Games-engine',
  engineTechnical: 'https://github.com/JustAdev742/Jovian-Games-engine/blob/HEAD/docs/TECHNICAL.md',
  engineMcp: 'https://github.com/JustAdev742/Jovian-Games-engine/blob/HEAD/mcp/README.md',
  cardsPlay: 'https://joviangame.me/cards-against-the-humanity/',
  cardsRepo: 'https://github.com/JustAdev742/cards-against-the-humanity',
  arcRepo: 'https://github.com/JustAdev742/Arc-Agi-3-Kaggle-comp',
  arcLessons: 'https://github.com/JustAdev742/Arc-Agi-3-Kaggle-comp/tree/HEAD/docs/lessons',
  kaggleCompetition: 'https://www.kaggle.com/competitions/arc-prize-2026-arc-agi-3',
  arcAgi3: 'https://arcprize.org/arc-agi/3',
  arcPrize2026: 'https://arcprize.org/competitions/2026',
  arcDocs: 'https://docs.arcprize.org/',
  voxelPlay: 'https://joviangame.me/Claude-AI-Games/voxel-odyssey/',
  voxelRepo: 'https://github.com/JustAdev742/Claude-AI-Games/tree/HEAD/voxel-odyssey',
  settlingDownload: 'https://github.com/JustAdev742/the-settling-download/releases/latest',
  sunburnApp: 'https://joviangame.me/Trashbin-robot/',
  sunburnRepo: 'https://github.com/JustAdev742/Trashbin-robot',
  neurogripRepo: 'https://github.com/JustAdev742/Project-NeuroGrip--BetaTouch-inc',
  cahLicense: 'https://creativecommons.org/licenses/by-nc-sa/2.0/',
} as const

/** Sections in page order. `nav` marks the ones that earn a place in the header. */
export const sections = [
  { id: 'studio', label: 'Studio', nav: true },
  { id: 'engine', label: 'Engine', nav: true },
  { id: 'cards', label: 'Games', nav: true },
  { id: 'research', label: 'Research', nav: true },
  { id: 'lab', label: 'Lab', nav: true },
  { id: 'archive', label: 'Archive', nav: true },
] as const

export type SectionId = (typeof sections)[number]['id']
