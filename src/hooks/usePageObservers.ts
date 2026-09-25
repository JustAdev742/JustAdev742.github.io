import { useEffect, useState } from 'react'
import type { SectionId } from '../content/site'

/**
 * One IntersectionObserver for every `[data-reveal]` element on the page.
 * Each element is revealed once, then forgotten.
 */
export function useRevealObserver() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          entry.target.classList.add('is-in')
          observer.unobserve(entry.target)
        }
      },
      { rootMargin: '0px 0px -12% 0px', threshold: 0.12 },
    )
    // The engine story's small-screen crops push in once a frame is mostly in view.
    const crops = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          entry.target.classList.add('is-in')
          crops.unobserve(entry.target)
        }
      },
      { threshold: 0.6 },
    )
    const observe = (root: ParentNode) => {
      root.querySelectorAll('[data-reveal]:not(.is-in)').forEach((el) => observer.observe(el))
      root.querySelectorAll('[data-crop]:not(.is-in)').forEach((el) => crops.observe(el))
    }
    observe(document)

    // Content rendered later (filters, tabs) is picked up as it arrives.
    const mutations = new MutationObserver((records) => {
      for (const record of records) {
        record.addedNodes.forEach((node) => {
          if (!(node instanceof Element)) return
          if (node.matches('[data-reveal]:not(.is-in)')) observer.observe(node)
          observe(node)
        })
      }
    })
    mutations.observe(document.body, { childList: true, subtree: true })
    ;(window as unknown as { __jovianReady?: boolean }).__jovianReady = true

    return () => {
      observer.disconnect()
      crops.disconnect()
      mutations.disconnect()
    }
  }, [])
}

/**
 * Sections declare the canvas they want (`data-canvas="ink" | "cool"`). The
 * one nearest the middle of the viewport sets it on <html>, and the page
 * background eases between them.
 */
export function useCanvasTheme() {
  useEffect(() => {
    const root = document.documentElement
    const meta = document.querySelector('meta[name="theme-color"]')
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          const theme = (entry.target as HTMLElement).dataset.canvas
          if (theme && theme !== 'warm') root.dataset.canvas = theme
          else delete root.dataset.canvas
          // Mobile browser chrome follows the page.
          meta?.setAttribute('content', getComputedStyle(root).getPropertyValue('--canvas').trim() || '#0b0a08')
        }
      },
      { rootMargin: '-50% 0px -50% 0px' },
    )
    document.querySelectorAll('[data-canvas]').forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])
}

/** Which navigable section is under the middle of the viewport. */
export function useActiveSection(): SectionId | null {
  const [active, setActive] = useState<SectionId | null>(null)
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive((entry.target as HTMLElement).dataset.navSection as SectionId)
        }
      },
      { rootMargin: '-45% 0px -54% 0px' },
    )
    const targets = document.querySelectorAll('[data-nav-section]')
    targets.forEach((el) => observer.observe(el))

    // Above the first section, nothing is active.
    const onScroll = () => {
      const first = targets[0] as HTMLElement | undefined
      if (first && first.getBoundingClientRect().top > window.innerHeight * 0.5) setActive(null)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      observer.disconnect()
      window.removeEventListener('scroll', onScroll)
    }
  }, [])
  return active
}

/**
 * The header steps aside while reading downwards and comes back the moment
 * the reader scrolls up, or reaches the top.
 */
export function useHeaderHidden(): boolean {
  const [hidden, setHidden] = useState(false)
  useEffect(() => {
    let lastY = window.scrollY
    let frame = 0
    const update = () => {
      frame = 0
      const y = window.scrollY
      const delta = y - lastY
      if (Math.abs(delta) < 6) return
      setHidden(delta > 0 && y > 160)
      lastY = y
    }
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      cancelAnimationFrame(frame)
    }
  }, [])
  return hidden
}
