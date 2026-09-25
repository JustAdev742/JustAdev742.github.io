import { media } from './media.gen'
import { projects, type Project } from './projects'
import { BUILD_DATE, links, SITE_URL } from './site'

// The page as linked data (schema.org JSON-LD), built from the same content the
// page renders, so search engines and answer engines read the same facts a
// visitor does, including the project details that only open in a sheet.
// scripts/prerender.mjs writes it into <head> at build time.

const id = (fragment: string) => `${SITE_URL}#${fragment}`
const studio = { '@id': id('studio') }

/** What each project is, in schema.org terms. */
const kinds: Record<string, (project: Project) => Record<string, unknown>> = {
  'jovian-engine': () => ({ '@type': 'SoftwareApplication', applicationCategory: 'DeveloperApplication', operatingSystem: 'Windows 10, Windows 11' }),
  'cards-against-the-humanity': () => ({ '@type': 'VideoGame', gamePlatform: 'Web browser', playMode: 'MultiPlayer', license: links.cahLicense }),
  'arc-agi-3': () => ({ '@type': 'SoftwareSourceCode', programmingLanguage: 'Python' }),
  'cards-3d': () => ({ '@type': 'SoftwareSourceCode', programmingLanguage: 'Lua' }),
  skyward: () => ({ '@type': 'SoftwareSourceCode', programmingLanguage: 'Lua' }),
  'voxel-odyssey': () => ({ '@type': 'VideoGame', gamePlatform: 'Web browser' }),
  'the-settling': (project) => ({
    '@type': 'SoftwareApplication',
    applicationCategory: 'GameApplication',
    softwareRequirements: 'Minecraft Forge 1.20.1',
    softwareVersion: project.status.label.replace(/^v/i, ''),
  }),
  'sunburn-device': () => ({ '@type': 'CreativeWork' }),
  neurogrip: () => ({ '@type': 'CreativeWork' }),
}

function projectNode(project: Project) {
  const kind = kinds[project.id]?.(project) ?? { '@type': 'CreativeWork' }
  const repo = project.links.find((link) => link.href.startsWith('https://github.com/'))?.href
  const source = kind['@type'] === 'SoftwareSourceCode'
  const url = (source ? repo : undefined) ?? project.links[0]?.href
  const others = project.links.map((link) => link.href).filter((href) => href !== url)
  return {
    ...kind,
    '@id': id(project.id),
    name: project.name,
    description: [project.summary, ...project.description].join(' '),
    url,
    ...(source && repo ? { codeRepository: repo } : {}),
    ...(others.length ? { sameAs: others } : {}),
    ...(project.media ? { image: SITE_URL + media[project.media.id].src } : {}),
    keywords: project.stack.join(', '),
    creator: studio,
  }
}

export function structuredData() {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': id('studio'),
        name: 'Jovian Games',
        url: SITE_URL,
        logo: `${SITE_URL}icon-512.png`,
        description: 'Jovian Games builds games, the engine they run on, and AI that learns to play them.',
        sameAs: [links.github],
      },
      {
        '@type': 'WebSite',
        '@id': id('website'),
        url: SITE_URL,
        name: 'Jovian Games',
        inLanguage: 'en',
        publisher: studio,
      },
      {
        '@type': 'WebPage',
        '@id': id('page'),
        url: SITE_URL,
        name: 'Jovian Games: games, engines and AI research',
        isPartOf: { '@id': id('website') },
        about: studio,
        primaryImageOfPage: `${SITE_URL}og.png`,
        dateModified: BUILD_DATE,
        mainEntity: { '@id': id('work') },
      },
      {
        '@type': 'ItemList',
        '@id': id('work'),
        name: 'Projects by Jovian Games',
        numberOfItems: projects.length,
        itemListElement: projects.map((project, index) => ({ '@type': 'ListItem', position: index + 1, item: { '@id': id(project.id) } })),
      },
      ...projects.map(projectNode),
    ],
  }
}

/**
 * The same facts as a plain-text brief for language models (llmstxt.org):
 * one line per project with its links, written to /llms.txt at build time.
 */
export function llmsText(): string {
  const project = (p: Project) => {
    const text = [p.summary, ...p.description].join(' ')
    const refs = p.links.map((link) => `[${link.label}](${link.href})`).join(', ')
    return `- **${p.name}** (${p.kind}, ${p.status.label}): ${text} Links: ${refs}.`
  }
  return [
    '# Jovian Games',
    '',
    '> Jovian Games builds games, the engine they run on, and AI that learns to play them.',
    '',
    `Everything on ${SITE_URL} is the studio’s own work. The source code is on GitHub: ${links.github}`,
    '',
    '## Projects',
    '',
    ...projects.map(project),
    '',
    `Updated ${BUILD_DATE}.`,
    '',
  ].join('\n')
}
