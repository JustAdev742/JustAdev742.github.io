import { addTransitionType, createContext, startTransition, use, useEffect, useMemo, useState, type ReactNode } from 'react'
import { projectById } from '../content/projects'

// Page-level UI state: the project index (⌘K) and the project sheet. The
// provider is the only place that knows how it is stored.

type OpenedBy = 'keyboard' | 'pointer'

/** Where a project sheet was opened from, so its image can morph back to it. */
export type SheetOrigin = 'lab' | 'archive' | 'studio' | 'index'

interface UIState {
  indexOpen: boolean
  projectId: string | null
  projectOrigin: SheetOrigin
}

interface UIActions {
  openIndex: (by: OpenedBy) => void
  closeIndex: () => void
  openProject: (id: string, origin: SheetOrigin) => void
  closeProject: () => void
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

function readSheetState(): SheetHistory | null {
  const state = window.history.state as SheetHistory | null
  return state && typeof state.project === 'string' ? state : null
}

export function UIProvider({ children }: { children: ReactNode }) {
  const [indexOpen, setIndexOpen] = useState(false)
  const [projectId, setProjectId] = useState<string | null>(null)
  const [projectOrigin, setProjectOrigin] = useState<SheetOrigin>('index')

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
      closeProject: () => {
        const state = readSheetState()
        // Opened from a history entry we pushed: step back, and popstate closes it.
        if (state && !state.initial) {
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
      startTransition(() => {
        addTransitionType('sheet')
        if (state && projectById.has(state.project)) {
          setProjectOrigin('index')
          setProjectId(state.project)
        } else {
          setProjectId(null)
        }
      })
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
