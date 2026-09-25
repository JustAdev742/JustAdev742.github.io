import type { CSSProperties, ElementType, HTMLAttributes, ReactNode } from 'react'
import type { SectionId } from '../../content/site'
import { cn } from '../../lib/cn'

interface SectionProps {
  id: SectionId
  /** The heading that names this section (for aria-labelledby). */
  labelledBy: string
  /** The page background this section asks for as it enters. */
  canvas?: 'warm' | 'ink' | 'cool'
  className?: string
  children: ReactNode
}

/** A top-level page section: named for assistive tech, tracked by the nav. */
export function Section({ id, labelledBy, canvas = 'warm', className, children }: SectionProps) {
  return (
    <section id={id} aria-labelledby={labelledBy} data-nav-section={id} data-canvas={canvas} className={cn('relative', className)}>
      {children}
    </section>
  )
}

interface EyebrowProps extends HTMLAttributes<HTMLParagraphElement> {
  index: string
  children: ReactNode
}

/** "01 — Engine": where you are in the page, in the instrument's voice. */
export function Eyebrow({ index, children, className, ...rest }: EyebrowProps) {
  return (
    <p className={cn('label flex items-center gap-3', className)} {...rest}>
      <span className="text-fg">{index}</span>{' '}
      <span aria-hidden="true" className="h-px w-8 bg-line-strong" />
      <span>{children}</span>
    </p>
  )
}

interface LinesProps {
  /** Each entry is one line of the heading, revealed from behind its own edge. */
  lines: ReactNode[]
  as?: ElementType
  id?: string
  className?: string
  delay?: number
  /** Section headings take focus when the index jumps to them. */
  sectionHeading?: boolean
}

/** A heading whose lines slide up from a mask as it scrolls into view. */
export function Lines({ lines, as: Tag = 'h2', id, className, delay = 0, sectionHeading = false }: LinesProps) {
  return (
    <Tag
      id={id}
      data-reveal="lines"
      data-section-heading={sectionHeading ? '' : undefined}
      tabIndex={sectionHeading ? -1 : undefined}
      className={cn('outline-none', className)}
      style={{ '--reveal-delay': `${delay}ms` } as CSSProperties}
    >
      {lines.map((line, index) => (
        <span key={index} className="mask-line" style={{ '--line-index': index } as CSSProperties}>
          {/* The trailing space keeps words apart for screen readers and copy-paste. */}
          <span>
            {line}
            {index < lines.length - 1 ? ' ' : null}
          </span>
        </span>
      ))}
    </Tag>
  )
}

/** Shorthand for the reveal attributes on any element. */
export function reveal(kind: 'up' | 'fade' | 'clip' = 'up', delay = 0) {
  return {
    'data-reveal': kind,
    style: { '--reveal-delay': `${delay}ms` } as CSSProperties,
  }
}
