// The engine told through its own editor. On large screens the screenshot
// stays pinned while the steps scroll past; each step zooms the stage to the
// part of the editor it describes. On smaller screens each step carries its
// own crop instead, so nothing is pinned and nothing is lost.

import { createContext, use, useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { m, useReducedMotion } from 'motion/react'
import { media } from '../../content/media.gen'
import { Picture } from '../ui/Picture'
import { cn } from '../../lib/cn'

/** A region of the editor screenshot, as fractions of its width and height. */
export interface Region {
  x: number
  y: number
  w: number
  h: number
}

interface StoryContextValue {
  active: number
  register: (index: number, element: HTMLElement | null) => void
}

const StoryContext = createContext<StoryContextValue | null>(null)

function useStory() {
  const context = use(StoryContext)
  if (!context) throw new Error('EditorStory parts must be inside <EditorStory.Root>')
  return context
}

function Root({ children, className }: { children: ReactNode; className?: string }) {
  const [active, setActive] = useState(0)
  const elements = useRef(new Map<number, HTMLElement>())
  const observer = useRef<IntersectionObserver | null>(null)

  useEffect(() => {
    // A step is current while it crosses the middle band of the viewport.
    observer.current = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(Number((entry.target as HTMLElement).dataset.step))
        }
      },
      { rootMargin: '-45% 0px -45% 0px' },
    )
    elements.current.forEach((el) => observer.current?.observe(el))
    return () => observer.current?.disconnect()
  }, [])

  const register = useCallback((index: number, element: HTMLElement | null) => {
    const previous = elements.current.get(index)
    if (previous) observer.current?.unobserve(previous)
    if (element) {
      elements.current.set(index, element)
      observer.current?.observe(element)
    } else {
      elements.current.delete(index)
    }
  }, [])
  const value = useMemo(() => ({ active, register }), [active, register])

  return (
    <StoryContext value={value}>
      <div className={className}>{children}</div>
    </StoryContext>
  )
}

const MAX_ZOOM = 2.6

/** Where to move a transform-origin-0 layer so a region fills the stage. */
function framing(region: Region) {
  const zoom = Math.min(MAX_ZOOM, 0.92 / Math.max(region.w, region.h))
  const cx = region.x + region.w / 2
  const cy = region.y + region.h / 2
  // Centre the region, then clamp so the image edge never shows.
  const x = Math.min(0, Math.max(1 - zoom, 0.5 - cx * zoom))
  const y = Math.min(0, Math.max(1 - zoom, 0.5 - cy * zoom))
  return { zoom, x: x * 100, y: y * 100 }
}

/** The pinned screenshot, zoomed to the active step's region. */
function Stage({ regions, alt }: { regions: Region[]; alt: string }) {
  const { active } = useStory()
  const reduced = useReducedMotion()
  const region = regions[active] ?? regions[0]!
  const { zoom, x, y } = framing(region)
  const full = region.w >= 0.99 && region.h >= 0.99
  const spring = reduced ? { duration: 0 } : { type: 'spring' as const, bounce: 0, duration: 0.9 }
  const editor = media['engine-editor']

  return (
    <div className="frame overflow-hidden" style={{ aspectRatio: `${editor.width} / ${editor.height}` }}>
      <m.div
        className="absolute inset-0 origin-top-left"
        initial={false}
        animate={{ scale: zoom, x: `${x}%`, y: `${y}%` }}
        transition={spring}
      >
        <Picture id="engine-editor" alt={alt} sizes="1600px" className="size-full" />
        <m.div
          aria-hidden="true"
          className="absolute rounded-[2px] shadow-[0_0_0_1px_var(--accent),0_0_0_9999px_rgb(0_0_0/0.46)] forced-colors:outline-2"
          initial={false}
          animate={{
            left: `${region.x * 100}%`,
            top: `${region.y * 100}%`,
            width: `${region.w * 100}%`,
            height: `${region.h * 100}%`,
            opacity: full ? 0 : 1,
          }}
          transition={spring}
        />
      </m.div>
      <span className="ticks" aria-hidden="true" />
    </div>
  )
}

interface StepProps {
  index: number
  label: string
  title: string
  children: ReactNode
  /** The region to crop to when the stage isn't pinned (small screens). */
  region: Region
  alt: string
}

/** One step of the story: text on large screens, text plus its own crop on small ones. */
function Step({ index, label, title, children, region, alt }: StepProps) {
  const { active, register } = useStory()
  const current = active === index
  const attach = useCallback((el: HTMLLIElement | null) => register(index, el), [index, register])
  const { zoom, x, y } = framing(region)
  const editor = media['engine-editor']

  return (
    <li
      ref={attach}
      data-step={index}
      aria-current={current ? 'step' : undefined}
      className="flex flex-col gap-6 lg:min-h-[66vh] lg:justify-center"
    >
      <div className="frame overflow-hidden lg:hidden" style={{ aspectRatio: `${editor.width} / ${editor.height}` }}>
        <div
          className="absolute inset-0 origin-top-left"
          style={{ transform: `translate(${x}%, ${y}%) scale(${zoom})` }}
        >
          <Picture id="engine-editor" alt={alt} sizes="100vw" className="size-full" />
        </div>
      </div>
      {/* Emphasis moves with colour, not opacity, so every step keeps AA contrast. */}
      <div className="flex max-w-[34rem] flex-col gap-3">
        <p className="label flex items-center gap-3">
          <span className={cn('transition-colors duration-500', current ? 'text-accent' : 'text-fg-subtle')}>{label}</span>
        </p>
        <h3 className={cn('text-h3 font-semibold tracking-[-0.015em] transition-colors duration-500', current ? 'text-fg' : 'text-fg lg:text-fg-muted')}>{title}</h3>
        <div className={cn('flex flex-col gap-3 transition-colors duration-500', current ? 'text-fg-muted' : 'text-fg-muted lg:text-fg-subtle')}>{children}</div>
      </div>
    </li>
  )
}

export const EditorStory = { Root, Stage, Step }
