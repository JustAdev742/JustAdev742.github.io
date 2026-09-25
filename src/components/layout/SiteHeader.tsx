import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { m, useScroll, useSpring } from 'motion/react'
import { sections } from '../../content/site'
import { preloadOverlays, useUI } from '../../app/ui'
import { useActiveSection, useHeaderHidden } from '../../hooks/usePageObservers'
import { cn } from '../../lib/cn'
import { Mark, Wordmark } from '../brand/Mark'
import { Grid } from '../ui/Icon'

export function SiteHeader() {
  const {
    state: { indexOpen, projectId },
    actions: { openIndex },
  } = useUI()
  const active = useActiveSection()
  const hidden = useHeaderHidden() && !indexOpen && !projectId
  const { scrollYProgress } = useScroll()
  const progress = useSpring(scrollYProgress, { stiffness: 400, damping: 60, restDelta: 0.001 })
  const [atTop, setAtTop] = useState(true)
  const [shortcut, setShortcut] = useState<string | null>(null)

  useEffect(() => {
    setShortcut(/Mac|iPhone|iPad/.test(navigator.platform) ? '⌘K' : 'Ctrl K')
    const onScroll = () => setAtTop(window.scrollY < 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // ⌘K / Ctrl K opens the index from anywhere but an open project sheet, so two
  // dialogs never stack. No single-key shortcut: a bare "/" fires by accident
  // under speech input (WCAG 2.1.4).
  useEffect(() => {
    if (projectId) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (!(event.metaKey || event.ctrlKey) || event.key.toLowerCase() !== 'k') return
      event.preventDefault()
      openIndex('keyboard')
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [openIndex, projectId])

  return (
    <header
      data-hidden={hidden ? '' : undefined}
      style={{ viewTransitionName: 'site-header' }}
      className={cn(
        'site-header fixed inset-x-0 top-0 z-50 transition-[transform,background-color,box-shadow] duration-300 ease-[var(--ease-out)]',
        atTop ? 'bg-transparent' : 'bg-canvas/95 shadow-[0_1px_0_var(--line)]',
      )}
    >
      <div className="shell flex h-[var(--header-h)] items-center justify-between gap-6">
        <a href="#top" className="press -ml-2 flex min-h-11 items-center gap-3 rounded-[var(--radius-control)] px-2" aria-label="Jovian Games, back to the top">
          <Mark size={22} className="text-fg" />
          {/* Under 320px (folding phones' cover screens) the mark stands alone; the link keeps its name. */}
          <Wordmark className="text-[0.8125rem] leading-none max-[320px]:hidden" />
        </a>

        <nav aria-label="Sections" className="relative hidden lg:block">
          <ActiveIndicator active={active} />
          <ul className="flex items-center gap-1">
            {sections.map((section) => {
              const current = active === section.id
              return (
                <li key={section.id}>
                  <a
                    data-nav-link={section.id}
                    href={`#${section.id}`}
                    aria-current={current ? 'location' : undefined}
                    className={cn(
                      'relative flex h-11 items-center px-3 text-[0.875rem] font-medium transition-colors duration-[var(--dur-hover)]',
                      current ? 'text-fg' : 'text-fg-muted hover:text-fg',
                    )}
                  >
                    {section.label}
                  </a>
                </li>
              )
            })}
          </ul>
        </nav>

        <button
          type="button"
          onClick={() => openIndex('pointer')}
          onPointerEnter={preloadOverlays}
          onFocus={preloadOverlays}
          aria-haspopup="dialog"
          aria-keyshortcuts="Meta+K Control+K"
          className="press -mr-2 flex h-11 items-center gap-3 rounded-[var(--radius-control)] px-3 text-[0.875rem] font-medium text-fg transition-colors duration-[var(--dur-hover)] hover:bg-fg/[0.07]"
        >
          <Grid className="text-fg-muted" />
          Index
          {shortcut ? (
            <kbd className="hidden rounded-[2px] border border-line-strong px-1.5 py-0.5 font-sans text-[0.6875rem] font-medium tracking-wide text-fg-subtle md:inline" aria-hidden="true">
              {shortcut}
            </kbd>
          ) : null}
        </button>
      </div>

      <m.div aria-hidden="true" style={{ scaleX: progress }} className="absolute inset-x-0 bottom-0 h-px origin-left bg-accent/70" />
    </header>
  )
}

/**
 * One hairline under the current section's link. It slides between links with
 * a CSS transition (interruptible, off the main thread) rather than a layout
 * animation, which keeps Motion's layout engine out of the page.
 */
function ActiveIndicator({ active }: { active: string | null }) {
  const bar = useRef<HTMLSpanElement>(null)
  const [shown, setShown] = useState(false)

  useLayoutEffect(() => {
    const el = bar.current
    const nav = el?.parentElement
    const link = active ? nav?.querySelector<HTMLElement>(`[data-nav-link="${active}"]`) : null
    if (!el || !nav || !link) {
      setShown(false)
      return
    }
    const inset = 12
    el.style.transform = `translateX(${link.offsetLeft + inset}px) scaleX(${link.offsetWidth - inset * 2})`
    setShown(true)
  }, [active])

  return (
    <span
      ref={bar}
      aria-hidden="true"
      className={cn(
        'pointer-events-none absolute bottom-2 left-0 h-px w-px origin-left bg-accent transition-[transform,opacity] duration-300 ease-[var(--ease-in-out)] motion-reduce:transition-none',
        shown ? 'opacity-100' : 'opacity-0',
      )}
    />
  )
}
