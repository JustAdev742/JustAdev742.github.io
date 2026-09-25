import { useSyncExternalStore } from 'react'

// Whether looping, decorative motion (the atmosphere, the agent demo) plays.
// Three states: follow the OS (default), paused, or playing. An explicit
// choice wins over the OS setting and persists; index.html applies it to
// <html data-motion> before first paint. Pausing satisfies WCAG 2.2.2.

const KEY = 'jovian:motion'
const REDUCED = '(prefers-reduced-motion: reduce)'
const listeners = new Set<() => void>()

function read(): boolean {
  const choice = document.documentElement.dataset.motion
  if (choice === 'paused') return false
  if (choice === 'playing') return true
  return !window.matchMedia(REDUCED).matches
}

function subscribe(onChange: () => void) {
  listeners.add(onChange)
  const list = window.matchMedia(REDUCED)
  list.addEventListener('change', onChange)
  return () => {
    listeners.delete(onChange)
    list.removeEventListener('change', onChange)
  }
}

export function setAmbientMotion(playing: boolean) {
  const value = playing ? 'playing' : 'paused'
  document.documentElement.dataset.motion = value
  try {
    localStorage.setItem(KEY, value)
  } catch {
    // Storage can be unavailable (private mode); the choice still holds for this visit.
  }
  listeners.forEach((listener) => listener())
}

/** True when ambient motion should play. False on the server and during hydration. */
export function useAmbientMotion(): boolean {
  return useSyncExternalStore(subscribe, read, () => false)
}
