import { useEffect, useRef, useState } from 'react'
import { useAmbientMotion } from '../../hooks/useAmbientMotion'
import { cn } from '../../lib/cn'
import { createAtmosphere, type Atmosphere } from './atmosphere'

/**
 * The live planet. Starts after first paint (idle time), compiles its shader
 * without blocking the page, cross-fades in over the static poster, and only
 * draws while it is on screen, the tab is visible, and the visitor hasn't
 * paused motion. If the GPU drops the context (phones do, under pressure), the
 * poster shows until the context comes back, then the planet is rebuilt.
 */
export function AtmosphereCanvas({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const atmosphere = useRef<Atmosphere | null>(null)
  const [ready, setReady] = useState(false)
  const playing = useAmbientMotion()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    let cancelled = false
    let cancelCreate = () => {}

    const init = () => {
      if (cancelled) return
      cancelCreate = createAtmosphere(canvas, (instance) => {
        atmosphere.current = instance
        setReady(true)
      })
    }
    const idle = window.requestIdleCallback
      ? window.requestIdleCallback(init, { timeout: 600 })
      : window.setTimeout(init, 120)

    const resize = new ResizeObserver(() => atmosphere.current?.resize())
    resize.observe(canvas)

    const onLost = (event: Event) => {
      // preventDefault asks the browser to restore the context when it can.
      event.preventDefault()
      cancelCreate()
      atmosphere.current?.stop()
      atmosphere.current = null
      setReady(false)
    }
    const onRestored = () => init()
    canvas.addEventListener('webglcontextlost', onLost)
    canvas.addEventListener('webglcontextrestored', onRestored)

    return () => {
      cancelled = true
      cancelCreate()
      if (window.cancelIdleCallback) window.cancelIdleCallback(idle)
      else window.clearTimeout(idle)
      resize.disconnect()
      canvas.removeEventListener('webglcontextlost', onLost)
      canvas.removeEventListener('webglcontextrestored', onRestored)
      atmosphere.current?.destroy()
      atmosphere.current = null
    }
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    const instance = atmosphere.current
    if (!ready || !canvas || !instance) return
    let inView = true
    const update = () => {
      if (playing && inView && !document.hidden) instance.start()
      else instance.stop()
    }
    const observer = new IntersectionObserver(([entry]) => {
      inView = Boolean(entry?.isIntersecting)
      update()
    })
    observer.observe(canvas)
    document.addEventListener('visibilitychange', update)
    update()
    return () => {
      observer.disconnect()
      document.removeEventListener('visibilitychange', update)
      instance.stop()
    }
  }, [playing, ready])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={cn('absolute inset-0 size-full transition-opacity duration-[1400ms] ease-out', ready ? 'opacity-100' : 'opacity-0', className)}
    />
  )
}
