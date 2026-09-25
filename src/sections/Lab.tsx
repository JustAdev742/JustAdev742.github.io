import { ViewTransition } from 'react'
import { projectById, type Project } from '../content/projects'
import { preloadOverlays, useUI } from '../app/ui'
import { cn } from '../lib/cn'
import { ArrowUpRight } from '../components/ui/Icon'
import { Picture } from '../components/ui/Picture'
import { Eyebrow, Lines, reveal, Section } from '../components/ui/Section'
import { StatusChip } from '../components/ui/StatusChip'

// Experiments, prototypes and small machines: each tile its own shape.

function OutLinks({ project }: { project: Project }) {
  return (
    <ul className="flex flex-wrap gap-x-5 gap-y-1">
      {project.links.map((link) => (
        <li key={link.href}>
          <a
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex min-h-11 items-center gap-1.5 text-small font-semibold text-fg transition-colors hover:text-accent"
          >
            {link.label}
            <ArrowUpRight size={14} className="transition-transform duration-[var(--dur-hover)] group-hover:-translate-y-px group-hover:translate-x-px" />
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
        </li>
      ))}
    </ul>
  )
}

interface TileProps {
  id: string
  className?: string
  mediaClassName?: string
  sizes: string
  fit?: 'cover' | 'contain'
}

/** A project with a picture. The picture opens the details and morphs into them. */
function MediaTile({ id, className, mediaClassName, sizes, fit = 'cover' }: TileProps) {
  const {
    state: { projectId, projectOrigin },
    actions: { openProject },
  } = useUI()
  const project = projectById.get(id)
  if (!project?.media) return null
  const open = projectId === id && projectOrigin === 'lab'

  return (
    <article className={cn('flex flex-col gap-5', className)} {...reveal('up')}>
      <button
        type="button"
        aria-haspopup="dialog"
        onClick={() => openProject(id, 'lab')}
        onPointerEnter={preloadOverlays}
        onFocus={preloadOverlays}
        className="press group relative block w-full cursor-pointer text-left"
      >
        <span className="sr-only">Open details for {project.name}</span>
        <span className={cn('frame block overflow-hidden', mediaClassName)}>
          {/* While its sheet is open the picture lives in the sheet, so it can travel back on close. */}
          {open ? null : (
            <ViewTransition name={`media-lab-${id}`} share="morph" default="none">
              <Picture
                id={project.media.id}
                alt=""
                sizes={sizes}
                fit={fit}
                className="size-full transition-transform duration-700 ease-[var(--ease-out)] group-hover:scale-[1.025]"
              />
            </ViewTransition>
          )}
          <span className="ticks" aria-hidden="true" />
        </span>
      </button>
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <p className="label">{project.kind}</p>
          <StatusChip status={project.status} />
        </div>
        <h3 className="text-h3 font-semibold tracking-[-0.015em]">{project.name}</h3>
        <p className="max-w-[52ch] text-fg-muted">{project.summary}</p>
        <p className="label text-fg-subtle">{project.stack.slice(0, 4).join(' · ')}</p>
        <OutLinks project={project} />
      </div>
    </article>
  )
}

/** The Settling has no screenshots, and needs none. */
function SettlingTile({ className }: { className?: string }) {
  const project = projectById.get('the-settling')!
  const line = 'The world is slowly learning how to become you.'
  return (
    <article className={cn('settling group relative flex flex-col justify-between gap-12 overflow-hidden rounded-[var(--radius-frame)] border border-line bg-surface-1 p-6 md:p-8', className)} {...reveal('up', 120)}>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <p className="label">{project.kind}</p>
        <StatusChip status={project.status} />
      </div>
      <p className="relative text-[clamp(1.75rem,1.2rem+2vw,2.75rem)] font-semibold leading-[1.08] tracking-[-0.02em] text-fg">
        <span className="relative z-10">{line}</span>
        {/* On hover the sentence begins to copy itself, not quite in register. */}
        <span aria-hidden="true" className="settling-echo absolute inset-0 text-accent">
          {line}
        </span>
      </p>
      <div className="flex flex-col gap-3">
        <h3 className="text-h3 font-semibold tracking-[-0.015em]">{project.name}</h3>
        <p className="text-fg-muted">A psychological horror mod for Minecraft, built on Forge 1.20.1.</p>
        <OutLinks project={project} />
      </div>
    </article>
  )
}

export function Lab() {
  return (
    <Section id="lab" labelledBy="lab-title" className="pt-[var(--section-y)]">
      <div className="shell">
        <div className="grid-12 gap-y-8">
          <div className="col-span-4 flex flex-col gap-8 md:col-span-7">
            <Eyebrow index="04" {...reveal('fade')}>
              Lab
            </Eyebrow>
            <Lines id="lab-title" sectionHeading className="text-h2 font-semibold tracking-[-0.025em]" lines={['Experiments, prototypes', 'and small machines.']} />
          </div>
          <p className="col-span-4 self-end text-fg-muted md:col-span-5 md:col-start-8" {...reveal('up', 100)}>
            Each of these started as a question and became a working build: a voxel world in one file, a horror mod, a wearable that nags about sunscreen, and a prosthetic hand that suggests a grip, then waits for you.
          </p>
        </div>

        <div className="mt-14 grid-12 gap-y-16">
          <MediaTile id="voxel-odyssey" className="col-span-4 md:col-span-12 lg:col-span-8" mediaClassName="aspect-video" sizes="(min-width: 1024px) 62vw, 94vw" />
          <SettlingTile className="col-span-4 min-h-[26rem] md:col-span-6 lg:col-span-4" />
          {/* The poster is a printed sheet, so it sits on a mat instead of running to the edges. */}
          <MediaTile id="sunburn-device" className="col-span-4 md:col-span-6 lg:col-span-5" mediaClassName="aspect-[3/4] bg-surface-2 p-[9%]" sizes="(min-width: 1024px) 31vw, 78vw" fit="contain" />
          <MediaTile id="neurogrip" className="col-span-4 md:col-span-6 lg:col-span-5 lg:col-start-7 lg:mt-24" mediaClassName="aspect-square" sizes="(min-width: 1024px) 38vw, 94vw" />
        </div>
      </div>
    </Section>
  )
}
