import { setAmbientMotion, useAmbientMotion } from '../../hooks/useAmbientMotion'
import { cn } from '../../lib/cn'
import { Pause, Play } from './Icon'

/** Pauses and resumes the page's looping motion, everywhere at once. */
export function MotionToggle({ className }: { className?: string }) {
  const playing = useAmbientMotion()
  return (
    <button
      type="button"
      onClick={() => setAmbientMotion(!playing)}
      className={cn(
        'label press inline-flex min-h-11 items-center gap-2 rounded-[var(--radius-control)] px-2 text-fg-subtle transition-colors hover:text-fg',
        className,
      )}
    >
      {playing ? <Pause size={14} /> : <Play size={14} />}
      {playing ? 'Pause motion' : 'Play motion'}
    </button>
  )
}
