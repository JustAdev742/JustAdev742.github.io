import { useRef, type ReactNode } from 'react'
import { m, useReducedMotion, useScroll, useTransform } from 'motion/react'
import { links } from '../content/site'
import { projectById } from '../content/projects'
import { EditorStory, type Region } from '../components/engine/EditorStory'
import { ActionLink, TextLink } from '../components/ui/Action'
import { Picture } from '../components/ui/Picture'
import { Eyebrow, Lines, reveal, Section } from '../components/ui/Section'
import { StatusChip } from '../components/ui/StatusChip'

const specs = [
  { label: 'Platform', value: 'Windows 10 and 11' },
  { label: 'Graphics', value: 'Direct3D 12 Ultimate' },
  { label: 'Language', value: 'C++20, HLSL' },
  { label: 'Scripting', value: 'Lua 5.4 and Blueprints' },
]

const EDITOR_ALT =
  'The Jovian editor: the World Outliner on the left, the card game running in the viewport with a stats overlay, workspace tabs along the top, and World Settings below.'

const story: { label: string; title: string; region: Region; body: string[] }[] = [
  {
    label: 'One process',
    title: 'The editor is the engine.',
    region: { x: 0, y: 0, w: 1, h: 1 },
    body: [
      'The same Direct3D 12 device and command queue that renders the game draws the editor. No web view, no Electron shell, no scripting-language UI layer.',
    ],
  },
  {
    label: 'Rendering',
    title: 'The viewport is the game.',
    region: { x: 0.172, y: 0.074, w: 0.62, h: 0.605 },
    body: [
      'A physically based Forward+ renderer with cascaded shadows, SSAO, screen-space reflections and, on hardware that has it, DXR ray-traced shadows, mesh shaders and variable-rate shading.',
      'The engine rasterises text onto 3D surfaces, and the sample builds every card that way.',
    ],
  },
  {
    label: 'Workspaces',
    title: '7 workspaces, 18 panels.',
    region: { x: 0.62, y: 0, w: 0.38, h: 0.06 },
    body: [
      'Level Design, Blueprint, Programming, Materials, Debugging, Profiling and Project: each workspace is a saved layout of docking panels.',
      'Lua 5.4 with a real line debugger. Blueprints compile to the same Lua, and Lua imports back into a graph.',
    ],
  },
  {
    label: 'Profiling',
    title: 'Measured, not guessed.',
    region: { x: 0.655, y: 0.54, w: 0.16, h: 0.16 },
    body: [
      'Every frame reports its cost: frame time, draw calls, triangles, culled instances. The profiler drills from the frame down to a single entity.',
      '26 tests and 150 assertions run from inside the editor.',
    ],
  },
  {
    label: 'Automation',
    title: 'Drivable by scripts and agents.',
    region: { x: 0, y: 0.05, w: 0.17, h: 0.9 },
    body: [
      'A JSON control server with 45 commands, a command-line client and a Model Context Protocol (MCP) server. Build scripts, CI and AI assistants use them to read the scene, create entities, run Lua against the live world and take screenshots.',
    ],
  },
]

const capabilities = [
  {
    title: 'Rendering',
    items: ['Forward+ PBR, HDR, filmic tonemapping', 'Cascaded shadows and a shadow atlas', 'SSAO, SSR, bloom, sky, height fog', 'DXR 1.1 shadows, mesh shaders, VRS', 'GPU instancing and automatic LOD'],
  },
  {
    title: 'Editor',
    items: ['Docking panels and seven workspaces', 'Gizmos, snapping, prefabs, undo', 'Content browser and material editor', 'Profiler down to a single entity', 'In-editor test runner'],
  },
  {
    title: 'Scripting',
    items: ['Lua 5.4 with breakpoints and watches', 'Blueprints that compile to Lua', 'Lua that imports back to a graph', 'Modules loaded with require'],
  },
  {
    title: 'Runtime',
    items: ['Physics and particles', 'A* navigation', 'Audio and animation', 'Network replication', 'Streaming'],
  },
  {
    title: 'Pipeline',
    items: ['glTF 2.0, GLB and OBJ import', 'One-click re-import', 'JSON control server, 45 commands', 'MCP server for AI assistants'],
  },
]

const gaps = [
  'Windows and Direct3D 12 only, no Vulkan or Metal yet',
  'No temporal anti-aliasing, upscaling, motion blur or depth of field',
  'No terrain, water, decals or volumetric lighting',
  'No material node graph, animation timeline or particle editor',
]

const next = [
  { title: 'Global team collaboration', body: 'Shared projects and team workflows, so people anywhere can build together.' },
  { title: 'Big visual updates', body: 'A major step up in rendering quality.' },
]

function TableShot() {
  const ref = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], reduced ? ['0%', '0%'] : ['-6%', '6%'])
  return (
    <figure ref={ref} className="flex flex-col gap-4">
      <div className="frame aspect-[16/9] overflow-hidden md:aspect-[1600/824]" {...reveal('clip')}>
        <m.div className="reveal-media absolute inset-[-7%_0]" style={{ y }}>
          <Picture
            id="engine-table"
            alt="A lamp-lit card table rendered in Jovian Engine: a black card reading “Mom!? You have to come pick me up! There’s ___ at this party!” above three white answer cards."
            sizes="(min-width: 1440px) 1360px, 94vw"
            className="size-full"
          />
        </m.div>
        <span className="ticks" aria-hidden="true" />
      </div>
      <figcaption className="max-w-[62ch] text-small text-fg-subtle">
        Cards Against The Humanity, rebuilt in 3D inside Jovian Engine. Every card is real geometry with its text rasterised onto it, so it catches the lamp and drops a shadow on the felt.
      </figcaption>
    </figure>
  )
}

function Sample({ id, image, alt, className, children }: { id: string; image: 'engine-judging' | 'engine-skyward'; alt: string; className?: string; children: ReactNode }) {
  const project = projectById.get(id)
  if (!project) return null
  return (
    <article className={className} {...reveal('up')}>
      <div className="frame aspect-[1600/824] overflow-hidden">
        <Picture id={image} alt={alt} sizes="(min-width: 1024px) 45vw, 94vw" className="size-full" />
      </div>
      <div className="mt-5 flex flex-col gap-2">
        <p className="label">{project.kind}</p>
        <h4 className="text-h3 font-semibold tracking-[-0.015em]">{project.name}</h4>
        <div className="text-fg-muted">{children}</div>
      </div>
    </article>
  )
}

export function Engine() {
  const engine = projectById.get('jovian-engine')!

  return (
    <Section id="engine" labelledBy="engine-title" className="pt-[var(--section-y)]">
      <div className="shell">
        <div className="grid-12 gap-y-10">
          <div className="col-span-4 flex flex-col gap-8 md:col-span-12 lg:col-span-7">
            <div className="flex flex-wrap items-center gap-x-6 gap-y-3" {...reveal('fade')}>
              <Eyebrow index="01">Engine</Eyebrow>
              <StatusChip status={engine.status} />
            </div>
            <Lines id="engine-title" sectionHeading className="caps-display text-display" lines={['Jovian', 'Engine']} />
            <p className="max-w-[30ch] text-[clamp(1.375rem,1.1rem+1vw,2rem)] font-medium leading-[1.2] tracking-[-0.015em]" {...reveal('up', 120)}>
              Jovian Engine is a DirectX 12 Ultimate game engine and editor, built from the ground up in C++20.
            </p>
          </div>
          <div className="col-span-4 flex flex-col justify-end gap-8 md:col-span-8 lg:col-span-5 lg:pl-[8%]">
            <p className="text-fg-muted" {...reveal('up', 200)}>
              The engine and its editor run as one native process, with a physically based renderer, Lua scripting with a real debugger, and visual scripting that compiles to the same Lua. An automation interface lets scripts and AI agents drive it.
            </p>
            <div className="flex flex-wrap gap-3" {...reveal('up', 260)}>
              <ActionLink href={links.engineRepo}>Explore Jovian Engine on GitHub</ActionLink>
              <ActionLink href={links.engineTechnical} variant="secondary">
                Technical reference
              </ActionLink>
            </div>
          </div>
        </div>

        <dl className="hairline-grid mt-14 grid-cols-2 md:grid-cols-4" {...reveal('fade', 100)}>
          {specs.map((spec) => (
            <div key={spec.label} className="flex flex-col gap-2 py-5 pr-4 [&:not(:nth-child(2n+1))]:pl-4 md:[&:not(:first-child)]:pl-5">
              <dt className="label">{spec.label}</dt>
              <dd className="font-medium">{spec.value}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-[clamp(3rem,6vw,5rem)]">
          <TableShot />
        </div>

        <EditorStory.Root className="mt-[clamp(5rem,10vw,9rem)] grid-12 gap-y-12">
          <div className="col-span-4 hidden md:col-span-12 lg:col-span-7 lg:block">
            <div className="sticky top-[calc(var(--header-h)+2rem)] flex h-[calc(100svh-var(--header-h)-4rem)] items-center">
              <div className="w-full">
                <EditorStory.Stage regions={story.map((step) => step.region)} alt={EDITOR_ALT} />
              </div>
            </div>
          </div>
          <div className="col-span-4 md:col-span-12 lg:col-span-5 lg:col-start-8">
            <h3 className="label mb-8 lg:mb-0 lg:pt-[14vh]" {...reveal('fade')}>
              Inside the editor
            </h3>
            <ol className="flex flex-col gap-16 lg:gap-0">
              {story.map((step, index) => (
                <EditorStory.Step key={step.title} index={index} label={`${String(index + 1).padStart(2, '0')} · ${step.label}`} title={step.title} region={step.region} alt={EDITOR_ALT}>
                  {step.body.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </EditorStory.Step>
              ))}
            </ol>
          </div>
        </EditorStory.Root>

        <div className="mt-[clamp(5rem,10vw,9rem)]">
          <h3 className="label" {...reveal('fade')}>
            What’s inside
          </h3>
          <div className="hairline-grid mt-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-5" {...reveal('fade')}>
            {capabilities.map((group, index) => (
              <div key={group.title} className="py-6 pr-6 sm:[&:nth-child(2n)]:pl-6 lg:px-5 lg:first:pl-0 lg:[&:nth-child(2n)]:pl-5">
                <div className="flex flex-col gap-4" {...reveal('up', index * 60)}>
                  <h4 className="font-semibold">{group.title}</h4>
                  <ul className="flex flex-col gap-2 text-small text-fg-muted">
                    {group.items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-[clamp(5rem,10vw,9rem)] flex flex-col gap-8">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <h3 className="text-h2 font-semibold tracking-[-0.025em]" {...reveal('up')}>
              Built with Jovian
            </h3>
            <p className="max-w-[40ch] text-fg-muted" {...reveal('up', 80)}>
              Both samples are plain Lua on top of the engine, and both ship in the repository to open, change and learn from.
            </p>
          </div>
          <div className="grid-12 gap-y-14">
            <Sample
              id="skyward"
              image="engine-skyward"
              alt="Skyward: a yellow bird flying between green pipes over rolling hills, a score of 12 at the top."
              className="col-span-4 md:col-span-7"
            >
              <p>A Flappy Bird replica built as a stress test: a rigged bird, pooled pipes, recycled scenery, real-time shadows and a scoreboard that is lit geometry in the world.</p>
              <dl className="mt-5 grid grid-cols-2 gap-x-6 gap-y-4 border-t border-line pt-5 sm:grid-cols-4">
                {[
                  ['645', 'entities'],
                  ['~500k', 'triangles'],
                  ['6', 'draw calls'],
                  ['<8 ms', 'GPU, RX 6700 XT'],
                ].map(([value, label]) => (
                  <div key={label} className="flex flex-col gap-1">
                    <dt className="label order-2">{label}</dt>
                    <dd className="order-1 whitespace-nowrap font-mono text-[1.375rem] font-medium tabular-nums tracking-[-0.02em] text-fg [font-stretch:87.5%]">{value}</dd>
                  </div>
                ))}
              </dl>
              <p className="mt-4 text-small text-fg-subtle">
                Figures from the <TextLink href={`${links.engineRepo}#skyward`}>engine README</TextLink>
              </p>
            </Sample>
            <Sample
              id="cards-3d"
              image="engine-judging"
              alt="Three answer cards face up on the felt while a bot judges, the scores on a banner below."
              className="col-span-4 md:col-span-5 md:mt-24"
            >
              <p>The web game as a lamp-lit card table. You play one seat; 3 bots with different senses of humour play the rest and take turns as Card Czar.</p>
            </Sample>
          </div>
        </div>

        <div className="mt-[clamp(5rem,10vw,9rem)] grid-12 gap-y-12 border-t border-line-strong pt-10">
          <div className="col-span-4 md:col-span-6" {...reveal('up')}>
            <h3 className="text-h3 font-semibold tracking-[-0.015em]">Honest about the gaps</h3>
            <p className="mt-3 max-w-[44ch] text-fg-muted">Nothing in the editor pretends to work. The biggest things it doesn’t do yet:</p>
            <ul className="mt-6 flex flex-col border-t border-line">
              {gaps.map((gap) => (
                <li key={gap} className="flex gap-4 border-b border-line py-3 text-small text-fg-muted">
                  <span aria-hidden="true" className="mt-[0.55em] h-px w-3 shrink-0 bg-fg-faint" />
                  {gap}
                </li>
              ))}
            </ul>
          </div>
          <div className="col-span-4 md:col-span-5 md:col-start-8" {...reveal('up', 120)}>
            <h3 className="text-h3 font-semibold tracking-[-0.015em]">Coming next</h3>
            <p className="mt-3 max-w-[44ch] text-fg-muted">Two things are planned, and neither is in this release. The repository will say so when they ship.</p>
            <ul className="mt-6 flex flex-col gap-6">
              {next.map((item) => (
                <li key={item.title} className="flex flex-col gap-1 border-l border-accent pl-5">
                  <span className="font-semibold">{item.title}</span>
                  <span className="text-small text-fg-muted">{item.body}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </Section>
  )
}
