import { useRef, ViewTransition } from 'react'
import { projectById, type Project } from '../../content/projects'
import { useUI, type SheetOrigin } from '../../app/ui'
import { ActionLink, IconButton } from '../ui/Action'
import { ArrowRight, Close } from '../ui/Icon'
import { Picture } from '../ui/Picture'
import { StatusChip } from '../ui/StatusChip'
import { Modal } from './Modal'

/** A project's details, opened from the archive or the index. */
export default function ProjectSheet() {
  const {
    state: { projectId, projectOrigin },
    actions: { closeProject },
  } = useUI()
  const project = projectId ? projectById.get(projectId) : undefined
  return project ? <Sheet key={project.id} project={project} origin={projectOrigin} onClose={closeProject} /> : null
}

function Sheet({ project, origin, onClose }: { project: Project; origin: SheetOrigin; onClose: (after?: () => void) => void }) {
  const closeButton = useRef<HTMLButtonElement>(null)
  const titleId = `sheet-title-${project.id}`
  const [primary, ...secondary] = project.links

  // Scroll and focus once the sheet has gone: until then the page is inert.
  const jumpToSection = () => {
    const target = project.section ? document.getElementById(project.section) : null
    onClose(() => {
      target?.scrollIntoView({ block: 'start' })
      target?.querySelector<HTMLElement>('[data-section-heading]')?.focus({ preventScroll: true })
    })
  }

  return (
    <Modal
      onClose={onClose}
      labelledBy={titleId}
      initialFocus={closeButton}
      transitionType="sheet"
      enter="sheet-in"
      exit="sheet-out"
      className="vt-fallback-sheet inset-y-0 right-0 flex w-full flex-col border-l border-line bg-surface-1 md:w-[min(38rem,92vw)]"
      scrimClassName="vt-fallback-fade"
    >
      <div className="flex h-[var(--header-h)] shrink-0 items-center justify-between border-b border-line pl-6 pr-2 md:pl-8">
        <p className="label">
          {project.kind} · {project.year}
        </p>
        <IconButton ref={closeButton} label="Close project details" onClick={() => onClose()}>
          <Close size={18} />
        </IconButton>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
        {project.media ? (
          <ViewTransition name={`media-${origin}-${project.id}`} share="morph" default="none">
            <div className="frame m-6 mb-0 aspect-[16/10] overflow-hidden md:m-8 md:mb-0">
              <Picture
                id={project.media.id}
                alt={project.media.alt}
                sizes="(min-width: 768px) 36rem, 100vw"
                className="size-full"
                imgClassName="object-top"
              />
            </div>
          </ViewTransition>
        ) : (
          <TypeCover project={project} />
        )}

        <div className="flex flex-col gap-8 p-6 md:p-8">
          <div className="flex flex-col gap-4">
            <StatusChip status={project.status} />
            <h2 id={titleId} className="text-h2 font-semibold tracking-[-0.025em]">
              {project.name}
            </h2>
            <p className="text-lead text-fg-muted">{project.summary}</p>
          </div>

          <div className="flex max-w-[60ch] flex-col gap-4 text-fg-muted">
            {project.description.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>

          <dl className="grid grid-cols-[7rem_1fr] gap-x-4 gap-y-3 border-t border-line pt-6 text-small">
            <dt className="label pt-0.5">Built with</dt>
            <dd className="text-fg">{project.stack.join(' · ')}</dd>
            <dt className="label pt-0.5">Status</dt>
            <dd className="text-fg">{project.status.label}</dd>
          </dl>

          <div className="flex flex-wrap gap-3">
            {primary ? <ActionLink href={primary.href}>{primary.label}</ActionLink> : null}
            {secondary.map((link) => (
              <ActionLink key={link.href} href={link.href} variant="secondary">
                {link.label}
              </ActionLink>
            ))}
          </div>

          {project.section ? (
            <button
              type="button"
              onClick={jumpToSection}
              className="group inline-flex w-fit items-center gap-2 py-2 text-small font-medium text-fg-muted transition-colors hover:text-fg"
            >
              See it on the page
              <ArrowRight className="transition-transform duration-[var(--dur-hover)] group-hover:translate-x-0.5" />
            </button>
          ) : null}
        </div>
      </div>
    </Modal>
  )
}

/** Projects without screenshots get a typographic cover instead of a placeholder. */
function TypeCover({ project }: { project: Project }) {
  return (
    <div className="frame relative m-6 mb-0 flex aspect-[16/10] items-end overflow-hidden p-6 md:m-8 md:mb-0">
      <div aria-hidden="true" className="type-cover-noise absolute inset-0" />
      <p className="relative text-balance text-[clamp(1.75rem,4vw,2.5rem)] font-bold uppercase leading-[0.95] tracking-[0.02em] [font-stretch:125%]">
        {project.name}
      </p>
    </div>
  )
}
