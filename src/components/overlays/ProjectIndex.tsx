// The index (⌘K / Ctrl K): jump to any section or project, or straight
// out to a live build. Adapted from the 21st.dev Command Palette by ddoemonn —
// the fuzzy ranking, keyboard model and live result count are theirs; the
// grouping, actions and styling are this site's. Deliberately unanimated: it is
// a keyboard tool, and a keyboard tool should never make you wait.

import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent, type PointerEvent } from 'react'
import { links } from '../../content/site'
import { projects } from '../../content/projects'
import { useUI, type SheetOrigin } from '../../app/ui'
import { cn } from '../../lib/cn'
import { useMediaQuery, FINE_POINTER } from '../../hooks/useMediaQuery'
import { ArrowRight, ArrowUpRight, Close, Search } from '../ui/Icon'
import { Modal } from './Modal'

type Action = { type: 'section'; target: string } | { type: 'project'; id: string } | { type: 'external'; href: string }

interface IndexItem {
  id: string
  label: string
  hint: string
  keywords?: string
  group: 'Sections' | 'Projects' | 'Play and read'
  action: Action
}

const FEATURED = new Set(['jovian-engine', 'cards-against-the-humanity', 'arc-agi-3'])

const ITEMS: IndexItem[] = [
  { id: 's-studio', group: 'Sections', label: 'Studio', hint: 'What we make', action: { type: 'section', target: 'studio' }, keywords: 'about principles' },
  { id: 's-engine', group: 'Sections', label: 'Jovian Engine', hint: 'Engine', action: { type: 'section', target: 'engine' }, keywords: 'directx dx12 editor renderer c++' },
  { id: 's-cards', group: 'Sections', label: 'Cards Against The Humanity', hint: 'Game', action: { type: 'section', target: 'cards' }, keywords: 'cah party tv phones' },
  { id: 's-research', group: 'Sections', label: 'ARC-AGI-3', hint: 'Research', action: { type: 'section', target: 'research' }, keywords: 'arc agi kaggle ai agent prize' },
  { id: 's-lab', group: 'Sections', label: 'Lab', hint: 'Experiments', action: { type: 'section', target: 'lab' }, keywords: 'prototypes hardware experiments' },
  { id: 's-archive', group: 'Sections', label: 'Archive', hint: 'Every project', action: { type: 'section', target: 'archive' }, keywords: 'all index list' },
  ...projects
    .filter((p) => !FEATURED.has(p.id))
    .map<IndexItem>((p) => ({
      id: `p-${p.id}`,
      group: 'Projects',
      label: p.name,
      hint: p.kind,
      keywords: p.keywords,
      action: { type: 'project', id: p.id },
    })),
  { id: 'x-play-cards', group: 'Play and read', label: 'Play Cards Against The Humanity', hint: 'joviangame.me', action: { type: 'external', href: links.cardsPlay }, keywords: 'play game live' },
  { id: 'x-play-voxel', group: 'Play and read', label: 'Play Voxel Odyssey', hint: 'joviangame.me', action: { type: 'external', href: links.voxelPlay }, keywords: 'play voxel browser' },
  { id: 'x-engine', group: 'Play and read', label: 'Jovian Engine on GitHub', hint: 'github.com', action: { type: 'external', href: links.engineRepo }, keywords: 'source code repository' },
  { id: 'x-kaggle', group: 'Play and read', label: 'ARC Prize 2026 on Kaggle', hint: 'kaggle.com', action: { type: 'external', href: links.kaggleCompetition }, keywords: 'competition leaderboard' },
  { id: 'x-github', group: 'Play and read', label: 'All our code on GitHub', hint: 'github.com', action: { type: 'external', href: links.github }, keywords: 'source repositories' },
]

const GROUPS: IndexItem['group'][] = ['Sections', 'Projects', 'Play and read']
const BOUNDARY = /[\s\-_/.:]/

/** Subsequence match that rewards word starts and runs (from the 21st palette). */
function scoreOne(text: string, query: string): number {
  const t = text.toLowerCase().replace(/\u00a0/g, ' ')
  let cursor = 0
  let total = 0
  let streak = 0
  for (let i = 0; i < query.length; i++) {
    const at = t.indexOf(query[i]!, cursor)
    if (at < 0) return -1
    streak = at === cursor && i > 0 ? streak + 1 : 0
    total += 2 + streak * 4
    if (at === 0) total += 12
    else if (BOUNDARY.test(t[at - 1]!)) total += 8
    cursor = at + 1
  }
  return total
}

function rank(items: IndexItem[], query: string): IndexItem[] {
  const q = query.trim().toLowerCase()
  if (!q) return items
  return items
    .map((item, order) => {
      const direct = scoreOne(item.label, q)
      const aliased = item.keywords ? scoreOne(item.keywords, q) - 3 : -1
      return { item, order, score: Math.max(direct, aliased) - item.label.length * 0.05 }
    })
    .filter((s) => s.score >= 0)
    .sort((a, b) => b.score - a.score || a.order - b.order)
    .map((s) => s.item)
}

export default function ProjectIndex() {
  const {
    state: { indexOpen },
    actions: { closeIndex, openProject },
  } = useUI()
  return indexOpen ? <Palette onClose={closeIndex} onOpenProject={openProject} /> : null
}

function Palette({ onClose, onOpenProject }: { onClose: () => void; onOpenProject: (id: string, origin: SheetOrigin) => void }) {
  const uid = useId()
  const fine = useMediaQuery(FINE_POINTER)
  const input = useRef<HTMLInputElement>(null)
  const list = useRef<HTMLDivElement>(null)
  const live = useRef<HTMLSpanElement>(null)
  const pointer = useRef({ x: -1, y: -1 })
  const [query, setQuery] = useState('')
  const [pinned, setPinned] = useState<string | null>(null)

  const results = useMemo(() => rank(ITEMS, query), [query])
  const searching = query.trim().length > 0
  const activeId = results.some((r) => r.id === pinned) ? pinned : (results[0]?.id ?? null)
  const activeIndex = results.findIndex((r) => r.id === activeId)

  // On touch screens, don't summon the keyboard over the list people came to browse.
  useEffect(() => {
    if (fine) input.current?.focus({ preventScroll: true })
  }, [fine])

  useEffect(() => {
    const id = setTimeout(() => {
      if (live.current) {
        live.current.textContent = results.length === 0 ? 'Nothing matches' : `${results.length} ${results.length === 1 ? 'result' : 'results'}`
      }
    }, 400)
    return () => clearTimeout(id)
  }, [results.length])

  const reveal = (id: string) => {
    const row = document.getElementById(`${uid}-${id}`)
    row?.scrollIntoView({ block: 'nearest' })
  }

  const jump = (index: number) => {
    const next = results[Math.max(0, Math.min(results.length - 1, index))]
    if (!next) return
    setPinned(next.id)
    reveal(next.id)
  }

  const run = (item: IndexItem | undefined) => {
    if (!item) return
    const { action } = item
    if (action.type === 'external') {
      window.open(action.href, '_blank', 'noopener,noreferrer')
      onClose()
      return
    }
    if (action.type === 'project') {
      onOpenProject(action.id, 'index')
      return
    }
    onClose()
    // After the index has closed and handed focus back, move to the section.
    requestAnimationFrame(() => {
      const target = document.getElementById(action.target)
      target?.scrollIntoView({ block: 'start' })
      target?.querySelector<HTMLElement>('[data-section-heading]')?.focus({ preventScroll: true })
    })
  }

  const onKeyDown = (event: KeyboardEvent) => {
    const len = results.length
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      if (len) jump((activeIndex + 1) % len)
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      if (len) jump((activeIndex - 1 + len) % len)
    } else if (event.key === 'Home' && !query) {
      event.preventDefault()
      jump(0)
    } else if (event.key === 'End' && !query) {
      event.preventDefault()
      jump(len - 1)
    } else if (event.key === 'Enter') {
      event.preventDefault()
      run(results[activeIndex])
    }
  }

  const onRowPointerMove = (id: string, event: PointerEvent) => {
    const { x, y } = pointer.current
    if (event.clientX === x && event.clientY === y) return
    pointer.current = { x: event.clientX, y: event.clientY }
    if (id !== activeId) setPinned(id)
  }

  const groups = searching ? [{ name: null, items: results }] : GROUPS.map((name) => ({ name, items: results.filter((r) => r.group === name) }))
  const titleId = `${uid}-title`

  return (
    <Modal
      onClose={onClose}
      labelledBy={titleId}
      transitionType="overlay"
      className="inset-0 flex flex-col bg-surface-1 md:inset-x-0 md:top-[12vh] md:bottom-auto md:mx-auto md:max-h-[76vh] md:w-[min(40rem,92vw)] md:rounded-[var(--radius-frame)] md:border md:border-line-strong"
    >
      <h2 id={titleId} className="sr-only">
        Index of sections and projects
      </h2>
      <div className="flex h-16 shrink-0 items-center gap-3 border-b border-line pl-5 pr-2 transition-colors has-[input:focus-visible]:border-accent/70">
        <Search size={18} className="shrink-0 text-fg-subtle" />
        <input
          ref={input}
          type="text"
          name="query"
          role="combobox"
          aria-label="Search sections and projects"
          aria-expanded="true"
          aria-controls={`${uid}-list`}
          aria-autocomplete="list"
          aria-activedescendant={activeId ? `${uid}-${activeId}` : undefined}
          autoComplete="off"
          spellCheck={false}
          enterKeyHint="go"
          value={query}
          placeholder="Search projects, sections, links…"
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={onKeyDown}
          className="h-full min-w-0 flex-1 bg-transparent text-[1.0625rem] text-fg outline-none placeholder:text-fg-subtle"
        />
        <button
          type="button"
          onClick={onClose}
          className="label press inline-flex h-11 shrink-0 items-center gap-2 rounded-[var(--radius-control)] px-3 transition-colors hover:bg-fg/[0.07] hover:text-fg"
        >
          <span className="hidden md:inline">Esc</span>
          <Close size={16} className="md:hidden" />
          <span className="sr-only md:hidden">Close</span>
        </button>
      </div>

      <div
        ref={list}
        id={`${uid}-list`}
        role="listbox"
        aria-label="Sections and projects"
        onMouseDown={(event) => event.preventDefault()}
        className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-2"
      >
        {groups.map((group) =>
          group.items.length === 0 ? null : (
            <div key={group.name ?? 'results'} role="group" aria-labelledby={group.name ? `${uid}-g-${group.name}` : undefined} aria-label={group.name ? undefined : 'Results'}>
              {group.name ? (
                <p id={`${uid}-g-${group.name}`} className="label px-3 pb-2 pt-4 first:pt-2">
                  {group.name}
                </p>
              ) : null}
              {group.items.map((item) => {
                const active = item.id === activeId
                const external = item.action.type === 'external'
                return (
                  <div
                    key={item.id}
                    id={`${uid}-${item.id}`}
                    role="option"
                    aria-selected={active}
                    onPointerMove={(event) => onRowPointerMove(item.id, event)}
                    onClick={() => run(item)}
                    className={cn(
                      'flex min-h-12 cursor-pointer items-center gap-4 rounded-[var(--radius-control)] px-3 py-2',
                      active ? 'bg-fg/[0.08] text-fg' : 'text-fg-muted',
                    )}
                  >
                    <span className="min-w-0 flex-1 truncate text-[1rem] font-medium">{item.label}</span>
                    <span className={cn('label hidden shrink-0 sm:inline', active && 'text-fg-muted')}>{item.hint}</span>
                    {external ? (
                      <ArrowUpRight className={cn('shrink-0', active ? 'text-accent' : 'text-fg-faint')} />
                    ) : (
                      <ArrowRight className={cn('shrink-0', active ? 'text-accent' : 'text-fg-faint')} />
                    )}
                  </div>
                )
              })}
            </div>
          ),
        )}
        {results.length === 0 ? <p className="px-3 py-10 text-center text-fg-subtle">Nothing matches “{query}”.</p> : null}
      </div>

      {fine ? (
        <div className="hidden shrink-0 items-center gap-5 border-t border-line px-5 py-3 md:flex" aria-hidden="true">
          <span className="label">↑↓ Move</span>
          <span className="label">Enter Open</span>
          <span className="label">Esc Close</span>
        </div>
      ) : null}
      <span ref={live} role="status" aria-live="polite" className="sr-only" />
    </Modal>
  )
}
