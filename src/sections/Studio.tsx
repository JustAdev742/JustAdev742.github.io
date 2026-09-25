import { projectById } from '../content/projects'
import { links } from '../content/site'
import { preloadOverlays, useUI } from '../app/ui'
import { Eyebrow, Lines, reveal, Section } from '../components/ui/Section'
import { TextLink } from '../components/ui/Action'

// What the studio makes, told through the work rather than about it.

const disciplines = [
  {
    no: '01',
    name: 'Engines',
    line: 'Rendering, tools and runtime, from the GPU up.',
    projects: ['jovian-engine'],
  },
  {
    no: '02',
    name: 'Games',
    line: 'Things people play together, on whatever screen is nearby.',
    projects: ['cards-against-the-humanity', 'voxel-odyssey', 'the-settling', 'skyward'],
  },
  {
    no: '03',
    name: 'AI research',
    line: 'Agents that learn unfamiliar worlds by acting in them.',
    projects: ['arc-agi-3', 'neurogrip'],
  },
  {
    no: '04',
    name: 'Hardware',
    line: 'Small devices with one job to do well.',
    projects: ['sunburn-device', 'neurogrip'],
  },
]

// Each principle is lifted from the work itself, and says where.
const principles = [
  {
    title: 'Nothing pretends to work.',
    body: 'Every button in the Jovian editor does real work, or it’s disabled and says why. The README lists what’s missing instead of hiding it.',
    source: { label: 'From the engine README', href: `${links.engineRepo}#honest-about-the-gaps` },
  },
  {
    title: 'Measure it, or it didn’t happen.',
    body: 'Research changes are hypotheses: run the fixed evaluation, keep or revert, and write the result in the log either way.',
    source: { label: 'From the ARC-AGI-3 research log', href: `${links.arcRepo}/blob/HEAD/docs/research_log.md` },
  },
  {
    title: 'Even the jokes get tested.',
    body: 'We score the card bots against held-out benchmarks of real cards, so whether they’re funny is something we can check.',
    source: { label: 'From the Cards README', href: `${links.cardsRepo}#is-any-of-that-actually-working` },
  },
]

const featuredSection: Record<string, string> = {
  'jovian-engine': '#engine',
  'cards-against-the-humanity': '#cards',
  'arc-agi-3': '#research',
}

function ProjectLink({ id }: { id: string }) {
  const {
    actions: { openProject },
  } = useUI()
  const project = projectById.get(id)
  if (!project) return null
  const anchor = featuredSection[id]
  const className =
    'text-fg underline decoration-line-control decoration-1 underline-offset-[0.22em] transition-colors hover:decoration-fg'
  return anchor ? (
    <a href={anchor} className={className}>
      {project.name}
    </a>
  ) : (
    <button
      type="button"
      aria-haspopup="dialog"
      onPointerEnter={preloadOverlays}
      onFocus={preloadOverlays}
      onClick={() => openProject(id, 'studio')}
      className={`${className} cursor-pointer text-left`}
    >
      {project.name}
    </button>
  )
}

export function Studio() {
  return (
    <Section id="studio" labelledBy="studio-title" className="pt-[var(--section-y)]">
      <div className="shell">
        <div className="grid-12 gap-y-10">
          <div className="col-span-4 md:col-span-3">
            <Eyebrow index="00" {...reveal('fade')}>
              Studio
            </Eyebrow>
          </div>
          <div className="col-span-4 flex flex-col gap-10 md:col-span-9">
            <Lines
              id="studio-title"
              sectionHeading
              className="text-[clamp(2.25rem,1.5rem+3.2vw,4.75rem)] font-semibold leading-[1.02] tracking-[-0.03em]"
              lines={['Jovian Games builds games,', 'the engine they run on,', 'and AI that learns', 'to play them.']}
            />
            <p className="max-w-[46ch] text-lead text-fg-muted" {...reveal('up', 150)}>
              Everything on this page was made here: a DirectX 12 engine written from scratch, a party game that
              turns any TV into a table, an agent competing in ARC-AGI-3, and the experiments that didn’t fit
              anywhere else.
            </p>
          </div>
        </div>

        <ul className="mt-[clamp(4rem,8vw,7rem)] border-t border-line-strong" aria-label="What we make">
          {disciplines.map((discipline, index) => (
            <li
              key={discipline.no}
              className="grid-12 items-baseline gap-y-2 border-b border-line py-6 md:py-8"
              {...reveal('up', index * 70)}
            >
              <span className="label col-span-1">{discipline.no}</span>
              <h3 className="col-span-3 text-h3 font-semibold tracking-[-0.015em] md:col-span-3">{discipline.name}</h3>
              <p className="col-span-4 text-fg-muted md:col-span-4">{discipline.line}</p>
              <p className="col-span-4 flex flex-wrap gap-x-4 gap-y-1 md:col-span-4">
                {discipline.projects.map((id) => (
                  <ProjectLink key={id} id={id} />
                ))}
              </p>
            </li>
          ))}
        </ul>

        <div className="mt-[clamp(4rem,8vw,7rem)] grid-12 gap-y-10">
          <h3 className="label col-span-4 md:col-span-12 lg:col-span-3" {...reveal('fade')}>
            How we work
          </h3>
          <ol className="col-span-4 grid gap-x-[var(--gutter)] gap-y-10 md:col-span-12 md:grid-cols-3 lg:col-span-9">
            {principles.map((principle, index) => (
              <li key={principle.title} className="flex flex-col gap-4 md:border-l md:border-line md:pl-6" {...reveal('up', index * 70)}>
                <span className="label text-accent">{String(index + 1).padStart(2, '0')}</span>
                <p className="text-h3 font-semibold leading-[1.15] tracking-[-0.015em]">{principle.title}</p>
                <p className="text-fg-muted">{principle.body}</p>
                {/* The ::after stretches the tap target to 44px without moving the layout. */}
                <TextLink href={principle.source.href} className="relative mt-auto w-fit text-small text-fg-subtle after:absolute after:inset-x-0 after:-inset-y-3">
                  {principle.source.label}
                </TextLink>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </Section>
  )
}
