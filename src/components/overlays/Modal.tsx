import { useEffect, useRef, ViewTransition, type ReactNode, type RefObject } from 'react'
import { createPortal } from 'react-dom'
import { cn } from '../../lib/cn'

interface ModalProps {
  onClose: () => void
  labelledBy: string
  children: ReactNode
  /** Positions and sizes the panel. */
  className?: string
  /** Where focus lands on open; the panel itself otherwise. */
  initialFocus?: RefObject<HTMLElement | null>
  /** View-transition classes for the panel, keyed by transition type. */
  enter?: string
  exit?: string
  transitionType: string
  /** Extra classes for the scrim (e.g. a CSS entrance where view transitions are missing). */
  scrimClassName?: string
}

/**
 * A modal layer rendered at the end of <body>. While it is open the page
 * behind is inert, so focus and the screen reader stay inside; Escape or a
 * click on the scrim closes it, and focus goes back to whatever opened it.
 * Declarative rather than <dialog>.showModal() so React view transitions can
 * animate it and morph shared elements into it.
 */
export function Modal({
  onClose,
  labelledBy,
  children,
  className,
  initialFocus,
  enter = 'fade-in',
  exit = 'fade-out',
  transitionType,
  scrimClassName,
}: ModalProps) {
  const panel = useRef<HTMLDivElement>(null)
  const close = useRef(onClose)
  close.current = onClose

  useEffect(() => {
    const page = document.getElementById('page')
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null
    const root = document.documentElement
    const overflow = root.style.overflow

    page?.setAttribute('inert', '')
    root.style.overflow = 'hidden'
    ;(initialFocus?.current ?? panel.current)?.focus({ preventScroll: true })

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      event.preventDefault()
      close.current()
    }
    document.addEventListener('keydown', onKeyDown)

    return () => {
      document.removeEventListener('keydown', onKeyDown)
      page?.removeAttribute('inert')
      root.style.overflow = overflow
      if (previous?.isConnected) previous.focus({ preventScroll: true })
    }
    // Runs once per opening; the ref keeps the latest onClose.
  }, [initialFocus])

  return createPortal(
    <>
      {/* One name for every scrim: going from the index to a sheet, the dimming
          carries straight across instead of lifting and falling again. */}
      <ViewTransition
        name="modal-scrim"
        share="auto"
        enter={{ [transitionType]: 'fade-in', default: 'none' }}
        exit={{ [transitionType]: 'fade-out', default: 'none' }}
        default="none"
      >
        <div aria-hidden="true" className={cn('fixed inset-0 z-[80] bg-black/65', scrimClassName)} onClick={() => close.current()} />
      </ViewTransition>
      <ViewTransition
        enter={{ [transitionType]: enter, default: 'none' }}
        exit={{ [transitionType]: exit, default: 'none' }}
        default="none"
      >
        <div
          ref={panel}
          role="dialog"
          aria-modal="true"
          aria-labelledby={labelledBy}
          tabIndex={-1}
          className={cn('fixed z-[81] outline-none', className)}
        >
          {/* A named region, so everything in the dialog sits inside a landmark. */}
          <section aria-labelledby={labelledBy} className="flex min-h-0 flex-1 flex-col">
            {children}
          </section>
        </div>
      </ViewTransition>
    </>,
    document.body,
  )
}
