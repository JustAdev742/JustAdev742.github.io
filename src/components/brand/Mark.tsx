import { useId } from 'react'

/**
 * The Jovian mark: a banded planet with its storm. Three curved belts make the
 * disc read as a sphere; the one warm oval is the Great Red Spot, drawn in the
 * studio accent.
 */
export function Mark({ size = 24, className }: { size?: number; className?: string }) {
  const clip = useId()
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" focusable="false" className={className}>
      <defs>
        <clipPath id={clip}>
          <circle cx="12" cy="12" r="10" />
        </clipPath>
      </defs>
      <g clipPath={`url(#${clip})`}>
        <rect x="0" y="0" width="24" height="24" fill="currentColor" />
        {/* Belts curve like latitude lines seen from a little above the equator. */}
        <g fill="none" stroke="var(--canvas, #0b0a08)" strokeLinecap="round">
          <path d="M1 7.9Q12 11.1 23 7.9" strokeWidth="1.8" />
          <path d="M1 12.4Q12 15.4 23 12.4" strokeWidth="1" />
          <path d="M1 16.3Q12 19.1 23 16.3" strokeWidth="1.6" />
        </g>
        <ellipse cx="15.8" cy="14.7" rx="2.7" ry="1.1" transform="rotate(-9 15.8 14.7)" fill="var(--accent, #ff7438)" />
      </g>
    </svg>
  )
}

/** The wordmark: expanded caps, letterspaced, as on the hero. */
export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={className} translate="no">
      <span className="font-bold uppercase tracking-[0.12em] [font-stretch:125%]">Jovian</span>{' '}
      <span className="font-medium uppercase tracking-[0.12em] text-fg-muted [font-stretch:125%]">Games</span>
    </span>
  )
}
