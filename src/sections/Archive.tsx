// Every project in one list. Adapted from the 21st.dev Hover Image List by
// educalvolpz — the pointer tracking, velocity skew and focus parity are
// theirs; the filters, rows, and the preview that lands in the project sheet
// are this site's.

import { addTransitionType, startTransition, useCallback, useEffect, useRef, useState, ViewTransition, type FocusEvent, type PointerEvent } from 'react'
import { m, useMotionValue, useReducedMotion, useSpring } from 'motion/react'
import { filters, projects, type Project, type ProjectFilter } from '../content/projects'
import { preloadOverlays, useUI } from '../app/ui'
import { FINE_POINTER, TABLET_UP, useMediaQuery } from '../hooks/useMediaQuery'
import { cn } from '../lib/cn'
import { ArrowRight } from '../components/ui/Icon'
import { Picture, StillPicture } from '../components/ui/Picture'
import { Eyebrow, Lines, reveal, Section } from '../components/ui/Section'
import { StatusChip } from '../components/ui/StatusChip'

const PREVIEW = { width: 300, height: 190 }
const PREVIEW_GAP = 8
const SPRING = { damping: 26, stiffness: 260 }
const SKEW_SPRING = { damping: 18, stiffness: 220 }
const MAX_SKEW = 6
const SKEW_FACTOR = 0.1

type Source = 'pointer' | 'focus' | null

/**
 * A touch screen has no cursor to carry the preview, so each row shows its own
 * picture instead, and that picture grows into the sheet when the row opens.
 * Hidden where the cursor preview takes over (a mouse on a wide screen). A
 * project without a picture shows nothing rather than an empty frame.
 */
function Thumb({ project, open }: { project: Project; open: boolean }) {
  if (!project.media) return null
  return (
    <span aria-hidden="true" className="frame relative block aspect-[16/10] w-16 shrink-0 overflow-hidden rounded-[var(--radius-frame)] bg-surface-2 sm:w-20 md:pointer-fine:hidden">
      {open ? null : (
        <ViewTransition name={`media-thumb-${project.id}`} share="morph" default="none">
          <StillPicture id={project.media.id} sizes="80px" className="size-full" />
        </ViewTransition>
      )}
    </span>
  )
}

export function Archive() {
  const {
    state: { projectId, projectOrigin },
    actions: { openProject },
  } = useUI()
  const reduced = useReducedMotion()
  const fine = useMediaQuery(FINE_POINTER)
  const wide = useMediaQuery(TABLET_UP)
  const [filter, setFilter] = useState<ProjectFilter | 'all'>('all')
  const [active, setActive] = useState<{ id: string; source: Source; origin: string } | null>(null)
  const list = useRef<HTMLDivElement>(null)
  const last = useRef<{ t: number; x: number } | null>(null)
  const pending = useRef<{ x: number; y: number } | null>(null)
  const frame = useRef(0)

  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const skew = useMotionValue(0)
  const springX = useSpring(x, SPRING)
  const springY = useSpring(y, SPRING)
  const springSkew = useSpring(skew, SKEW_SPRING)

  const visible = filter === 'all' ? projects : projects.filter((p) => p.filters.includes(filter))
  const activeProject = active ? visible.find((p) => p.id === active.id) : undefined
  // Follow the cursor only with a fine pointer, motion allowed, and a pointer (not focus) in charge.
  const following = fine && !reduced && active?.source === 'pointer'

  useEffect(() => () => cancelAnimationFrame(frame.current), [])

  // The preview covers neighbouring rows, so Escape puts it away until the
  // pointer or focus moves to another row (WCAG 1.4.13).
  useEffect(() => {
    if (!active || projectId) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setActive(null)
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [active, projectId])

  const onPointerMove = useCallback(
    (event: PointerEvent<HTMLDivElement>) => {
      if (!following) return
      pending.current = { x: event.clientX, y: event.clientY }
      if (frame.current) return
      frame.current = requestAnimationFrame((now) => {
        frame.current = 0
        const point = pending.current
        const container = list.current
        if (!point || !container) return
        const rect = container.getBoundingClientRect()
        const localX = point.x - rect.left
        const localY = point.y - rect.top
        if (last.current) {
          const dt = Math.min(now - last.current.t, 50)
          if (dt > 0) skew.set(Math.max(-MAX_SKEW, Math.min(MAX_SKEW, ((localX - last.current.x) / dt) * SKEW_FACTOR)))
        }
        last.current = { t: now, x: localX }
        x.set(localX + 28)
        y.set(localY - PREVIEW.height / 2)
      })
    },
    [following, skew, x, y],
  )

  const activate = (project: Project, source: Source, row?: HTMLElement) => {
    // It grows out of what it belongs to: the cursor on its left, or the row.
    let origin = '0% 50%'
    // Keyboard users get the preview beside the focused row, never over it:
    // above the row when the list has room, below it otherwise.
    if (source === 'focus' && row && list.current) {
      const box = list.current.getBoundingClientRect()
      const r = row.getBoundingClientRect()
      const above = r.top - box.top - PREVIEW.height - PREVIEW_GAP
      x.jump(box.width - PREVIEW.width)
      y.jump(above >= 0 ? above : r.bottom - box.top + PREVIEW_GAP)
      skew.jump(0)
      origin = above >= 0 ? '100% 100%' : '100% 0%'
    }
    setActive({ id: project.id, source, origin })
    preloadOverlays()
  }

  const onBlur = (event: FocusEvent<HTMLDivElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget)) setActive((current) => (current?.source === 'focus' ? null : current))
  }

  const choose = (next: ProjectFilter | 'all') => {
    startTransition(() => {
      addTransitionType('filter')
      setFilter(next)
    })
  }

  return (
    <Section id="archive" labelledBy="archive-title" className="pb-[clamp(5rem,8vw,8rem)] pt-[var(--section-y)]">
      <div className="shell">
        <div className="grid-12 gap-y-8">
          <div className="col-span-4 flex flex-col gap-8 md:col-span-7">
            <Eyebrow index="05" {...reveal('fade')}>
              Archive
            </Eyebrow>
            <Lines id="archive-title" sectionHeading className="text-h2 font-semibold tracking-[-0.025em]" lines={['Every project, in one list.']} />
          </div>
          <div className="col-span-4 flex flex-col justify-end gap-3 md:col-span-5 md:col-start-8" {...reveal('up', 100)}>
            <p id="archive-filter-label" className="label">
              Show
            </p>
            <div role="group" aria-labelledby="archive-filter-label" className="flex flex-wrap gap-2">
              {filters.map((option) => {
                const selected = filter === option.id
                const count = option.id === 'all' ? projects.length : projects.filter((p) => p.filters.includes(option.id as ProjectFilter)).length
                return (
                  <button
                    key={option.id}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => choose(option.id)}
                    className={cn(
                      'press inline-flex h-11 items-center gap-2 rounded-full border px-4 text-small font-medium transition-colors duration-[var(--dur-hover)]',
                      selected ? 'border-fg bg-fg text-canvas' : 'border-line-control text-fg-muted hover:border-fg hover:text-fg',
                    )}
                  >
                    {option.label}{' '}
                    <span className={cn('font-mono text-[0.6875rem] tabular-nums', selected ? 'text-canvas/70' : 'text-fg-subtle')}>{count}</span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        <div
          ref={list}
          className="relative mt-12"
          onPointerMove={onPointerMove}
          onPointerLeave={() => {
            last.current = null
            setActive((current) => (current?.source === 'pointer' ? null : current))
          }}
          onBlur={onBlur}
        >
          <div className="label hidden grid-cols-12 gap-x-[var(--gutter)] border-b border-line-strong pb-3 md:grid" aria-hidden="true">
            <span className="col-span-5">Project</span>
            <span className="col-span-3">Kind</span>
            <span className="col-span-2">Status</span>
            <span className="col-span-2 text-right">Year</span>
          </div>
          <p role="status" className="sr-only">
            {visible.length} {visible.length === 1 ? 'project' : 'projects'} shown
          </p>
          <ul aria-label="Projects">
            {visible.map((project) => (
              // Rows animate for filter changes only, not for every overlay on the page.
              <ViewTransition
                key={project.id}
                enter={{ filter: 'auto', default: 'none' }}
                exit={{ filter: 'auto', default: 'none' }}
                update={{ filter: 'auto', default: 'none' }}
                default="none"
              >
                <li className="border-b border-line">
                  <button
                    type="button"
                    aria-haspopup="dialog"
                    // The picture that morphs into the sheet: the cursor preview, or the row's own thumbnail.
                    onClick={() => openProject(project.id, fine && wide ? 'archive' : 'thumb')}
                    onPointerEnter={(event) => {
                      if (!fine || event.pointerType !== 'mouse') return
                      // Arriving from outside the list: start the preview at the cursor, not where it last was.
                      if (!active && list.current) {
                        const box = list.current.getBoundingClientRect()
                        const px = event.clientX - box.left + 28
                        const py = event.clientY - box.top - PREVIEW.height / 2
                        x.jump(px)
                        y.jump(py)
                        springX.jump(px)
                        springY.jump(py)
                      }
                      activate(project, 'pointer')
                    }}
                    onFocus={(event) => activate(project, 'focus', event.currentTarget)}
                    className="group grid w-full cursor-pointer grid-cols-4 items-baseline gap-x-[var(--gutter)] gap-y-1 py-5 text-left md:grid-cols-12 md:py-6"
                  >
                    <span className="col-span-4 flex items-center justify-between gap-4 md:col-span-5">
                      <span className="text-h3 font-semibold tracking-[-0.015em] transition-transform duration-300 ease-[var(--ease-out)] group-hover:translate-x-1">{project.name}</span>
                      <Thumb project={project} open={projectId === project.id && projectOrigin === 'thumb'} />
                    </span>
                    {' '}
                    <span className="col-span-4 text-small text-fg-muted md:col-span-3">{project.kind}</span>{' '}
                    <span className="col-span-2 md:col-span-2">
                      <StatusChip status={project.status} />
                    </span>
                    {' '}
                    <span className="label col-span-2 flex items-center justify-end gap-3 md:col-span-2">
                      {project.year}
                      <ArrowRight className="text-fg-faint transition-[transform,color] duration-[var(--dur-hover)] group-hover:translate-x-0.5 group-hover:text-accent" />
                    </span>
                  </button>
                </li>
              </ViewTransition>
            ))}
          </ul>

          {/* The preview: follows the cursor, sits beside a focused row, and lands in the sheet when opened. */}
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 hidden md:block">
            {activeProject && !projectId ? (
              <m.div
                className="absolute left-0 top-0 overflow-hidden rounded-[var(--radius-frame)] shadow-[0_24px_60px_-20px_rgb(0_0_0/0.8)]"
                style={{ width: PREVIEW.width, height: PREVIEW.height, x: following ? springX : x, y: following ? springY : y, skewX: following ? springSkew : 0, transformOrigin: active?.origin }}
                initial={{ opacity: 0, scale: reduced ? 1 : 0.94 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={reduced ? { duration: 0 } : { type: 'spring', bounce: 0.1, duration: 0.25 }}
              >
                {activeProject.media ? (
                  <ViewTransition name={`media-archive-${activeProject.id}`} share="morph" default="none">
                    <Picture key={activeProject.id} id={activeProject.media.id} alt="" sizes={`${PREVIEW.width}px`} className="size-full" imgClassName="object-top" />
                  </ViewTransition>
                ) : (
                  <div className="type-cover-noise flex size-full items-end p-5">
                    <span className="text-[1.375rem] font-bold uppercase leading-[0.95] tracking-[0.02em] [font-stretch:125%]">{activeProject.name}</span>
                  </div>
                )}
              </m.div>
            ) : null}
          </div>
        </div>
      </div>
    </Section>
  )
}
