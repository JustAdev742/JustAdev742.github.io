import { addTransitionType, createContext, startTransition, use, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { flushSync } from 'react-dom'
import { projectById } from '../content/projects'

// Page-level UI state: the project index (⌘K) and the project sheet. The
// provider is the only place that knows how it is stored.

type OpenedBy = 'keyboard' | 'pointer'

/** Where a project sheet was opened from, so its image can morph back to it. */
export type SheetOrigin = 'lab' | 'archive' | 'thumb' | 'studio' | 'index'

interface UIState {
  indexOpen: boolean
  projectId: string | null
  projectOrigin: SheetOrigin
}

interface UIActions {
  openIndex: (by: OpenedBy) => void
  closeIndex: () => void
  openProject: (id: string, origin: SheetOrigin) => void
  /** `after` runs once the sheet has gone and focus has been handed back. */
  closeProject: (after?: () => void) => void
}

interface UIContextValue {
  state: UIState
  actions: UIActions
}

const UIContext = createContext<UIContextValue | null>(null)

// A project sheet is a place you can link to: ?project=<id>. Opening one adds a
// history entry, so the browser's Back button closes it again.
type SheetHistory = { project: string; initial?: boolean }

function sheetUrl(id: string | null) {
  const url = new URL(window.location.href)
  if (id) url.searchParams.set('project', id)
  else url.searchParams.delete('project')
  return url
}

// WebKit (Safari, and every browser on iOS) crashed in testing when a closing
// sheet's picture morphed back into the page. The opening morph and the sheet's
// slide-out are fine, so there the sheet slides away and the picture waits in place.
function canMorphBack() {
  return navigator.vendor !== 'Apple Computer, Inc.'
}

function readSheetState(): SheetHistory | null {
  const state = window.history.state as SheetHistory | null
  return state && typeof state.project === 'string' ? state : null
}

export function UIProvider({ children }: { children: ReactNode }) {
  const [indexOpen, setIndexOpen] = useState(false)
  const [projectId, setProjectId] = useState<string | null>(null)
  const [projectOrigin, setProjectOrigin] = useState<SheetOrigin>('index')
  // Set while the page's own close (button, Escape, scrim) steps back through history.
  const closingFromPage = useRef(false)
  const afterClose = useRef<(() => void) | null>(null)

  const actions = useMemo<UIActions>(
    () => ({
      // Opened from the keyboard it appears at once: something used this often
      // should never make you wait. Opened with a pointer, it fades in.
      openIndex: (by) => {
        if (by === 'keyboard') {
          setIndexOpen(true)
          return
        }
        startTransition(() => {
          addTransitionType('overlay')
          setIndexOpen(true)
        })
      },
      closeIndex: () => setIndexOpen(false),
      openProject: (id, origin) => {
        startTransition(() => {
          addTransitionType('sheet')
          setIndexOpen(false)
          setProjectOrigin(origin)
          setProjectId(id)
        })
        const current = readSheetState()
        // Swapping one sheet for another replaces the entry; a deep-linked first
        // entry stays marked, so closing never steps back out of the site.
        if (current) window.history.replaceState({ project: id, initial: current.initial } satisfies SheetHistory, '', sheetUrl(id))
        else window.history.pushState({ project: id } satisfies SheetHistory, '', sheetUrl(id))
      },
      closeProject: (after) => {
        afterClose.current = after ?? null
        // Unpair the sheet's picture from the page before the close begins (see canMorphBack).
        if (!canMorphBack()) flushSync(() => setProjectOrigin('index'))
        const state = readSheetState()
        // Opened from a history entry we pushed: step back, and popstate closes it.
        if (state && !state.initial) {
          closingFromPage.current = true
          window.history.back()
          return
        }
        window.history.replaceState(null, '', sheetUrl(null))
        startTransition(() => {
          addTransitionType('sheet')
          setProjectId(null)
        })
      },
    }),
    [],
  )

  // Back and Forward move between the page and its sheets; a shared link opens one.
  useEffect(() => {
    const onPopState = () => {
      const state = readSheetState()
      const apply = () =>
        startTransition(() => {
          addTransitionType('sheet')
          if (state && projectById.has(state.project)) {
            setProjectOrigin('index')
            setProjectId(state.project)
          } else {
            setProjectId(null)
          }
        })
      // React applies a transition started inside popstate at once, with no view
      // transition: right for the browser's own Back (iOS animates its swipe
      // itself), wrong for our close button. That one steps just outside the
      // event, so the sheet leaves the way it arrived.
      if (closingFromPage.current) {
        closingFromPage.current = false
        window.setTimeout(apply, 0)
      } else apply()
    }
    window.addEventListener('popstate', onPopState)

    const linked = new URLSearchParams(window.location.search).get('project')
    if (linked && projectById.has(linked)) {
      window.history.replaceState({ project: linked, initial: true } satisfies SheetHistory, '', sheetUrl(linked))
      setProjectOrigin('index')
      setProjectId(linked)
    }
    return () => window.removeEventListener('popstate', onPopState)
  }, [])

  // Work that must wait for the sheet to be gone (it made the page inert, and
  // hands focus back as it leaves): one frame after the close has committed.
  useEffect(() => {
    if (projectId !== null || !afterClose.current) return
    const run = afterClose.current
    afterClose.current = null
    const frame = requestAnimationFrame(run)
    return () => cancelAnimationFrame(frame)
  }, [projectId])

  const value = useMemo(
    () => ({ state: { indexOpen, projectId, projectOrigin }, actions }),
    [indexOpen, projectId, projectOrigin, actions],
  )
  return <UIContext value={value}>{children}</UIContext>
}

export function useUI(): UIContextValue {
  const context = use(UIContext)
  if (!context) throw new Error('useUI must be used inside <UIProvider>')
  return context
}

// The dialogs are split out of the first bundle and fetched on intent.
export const loadProjectIndex = () => import('../components/overlays/ProjectIndex')
export const loadProjectSheet = () => import('../components/overlays/ProjectSheet')
export const preloadOverlays = () => {
  void loadProjectIndex()
  void loadProjectSheet()
}
