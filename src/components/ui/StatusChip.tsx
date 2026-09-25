import type { StatusTone } from '../../content/projects'
import { cn } from '../../lib/cn'

const toneColor: Record<StatusTone, string> = {
  live: 'text-accent',
  active: 'text-accent',
  research: 'text-research',
  neutral: 'text-fg-subtle',
}

/** A project's state: a dot for colour, a word so colour is never the only signal. */
export function StatusChip({ status, className }: { status: { label: string; tone: StatusTone }; className?: string }) {
  const animated = status.tone === 'live' || status.tone === 'active'
  return (
    <span className={cn('label inline-flex w-fit items-center gap-2 text-fg-muted', className)}>
      <span aria-hidden="true" className={cn('dot', toneColor[status.tone], animated && 'dot-live')} />
      {status.label}
    </span>
  )
}
