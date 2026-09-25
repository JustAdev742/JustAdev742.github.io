import { useSyncExternalStore } from 'react'

/**
 * Subscribes to a media query. Renders as `false` on the server and during
 * hydration, then updates, so the prerendered HTML always matches.
 */
export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const list = window.matchMedia(query)
      list.addEventListener('change', onChange)
      return () => list.removeEventListener('change', onChange)
    },
    () => window.matchMedia(query).matches,
    () => false,
  )
}

export const FINE_POINTER = '(hover: hover) and (pointer: fine)'
export const DESKTOP = '(min-width: 1024px)'
export const TABLET_UP = '(min-width: 768px)'
