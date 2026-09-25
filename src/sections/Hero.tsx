import { useRef, type CSSProperties } from 'react'
import { m, useReducedMotion, useScroll, useTransform } from 'motion/react'
import { AtmosphereCanvas } from '../components/hero/AtmosphereCanvas'
import { ArrowDown } from '../components/ui/Icon'
import { MotionToggle } from '../components/ui/MotionToggle'

const featured = [
  { no: '01', href: '#engine', name: 'Jovian Engine', note: 'DirectX 12 engine and editor' },
  { no: '02', href: '#cards', name: 'Cards Against The Humanity', note: 'The TV is the table' },
  { no: '03', href: '#research', name: 'ARC-AGI-3', note: 'AI research on Kaggle' },
]

const delay = (ms: number) => ({ '--delay': `${ms}ms` }) as CSSProperties

export function Hero() {
  const ref = useRef<HTMLElement>(null)
  const words = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const { scrollYProgress: wordsLeaving } = useScroll({ target: words, offset: ['start start', 'end start'] })
  // The planet sinks a little slower than the page; the words lift away a little faster.
  const planetY = useTransform(scrollYProgress, [0, 1], ['0%', reduced ? '0%' : '16%'])
  const wordsY = useTransform(scrollYProgress, [0, 1], ['0%', reduced ? '0%' : '-12%'])
  // The words dim only on their way out, so on a short screen they stay readable while in view.
  const fade = useTransform(wordsLeaving, [0.3, 1], [1, reduced ? 1 : 0.15])

  return (
    <section ref={ref} id="top" aria-labelledby="hero-title" data-canvas="warm" className="relative isolate flex min-h-[100svh] flex-col overflow-hidden">
      {/* Parallax on the outer layer, the CSS entrance on the inner one, so they never fight. */}
      <m.div aria-hidden="true" style={{ y: planetY }} className="absolute inset-0 -z-10">
        <div className="hero-planet absolute inset-0" style={delay(80)}>
          {/* Without WebGL, a painted limb stands in for the live planet. */}
          <div className="hero-fallback absolute inset-0" />
          <AtmosphereCanvas />
        </div>
        {/* The planet settles into the page rather than ending at a hard edge. */}
        <div className="absolute inset-x-0 bottom-0 h-[48%] bg-gradient-to-t from-canvas from-58% via-canvas/70 via-80% to-transparent md:h-[30%] md:from-35% md:via-50%" />
      </m.div>

      <m.div ref={words} style={{ y: wordsY, opacity: fade }} className="shell flex flex-1 flex-col pt-[calc(var(--header-h)+clamp(1.5rem,8.5vh,7rem))]">
        <h1 id="hero-title" translate="no" className="caps-display text-hero">
          <span className="block overflow-y-clip pb-[0.04em]">
            <span className="hero-rise block" style={delay(120)}>
              Jovian
            </span>
          </span>{' '}
          <span className="block overflow-y-clip pb-[0.04em] pl-[12%] md:pl-[22%]">
            <span className="hero-rise block" style={delay(230)}>
              Games
            </span>
          </span>
        </h1>

        <div className="mt-[clamp(1.5rem,5vh,2.5rem)] flex max-w-[32rem] flex-col gap-7">
          <p className="hero-fade-up text-lead text-fg-muted" style={delay(620)}>
            Games, software, AI, and experiments beyond the ordinary.
          </p>
          <div className="hero-fade-up flex flex-wrap gap-3" style={delay(760)}>
            <a
              href="#engine"
              className="press group inline-flex h-12 items-center gap-2.5 rounded-[var(--radius-control)] bg-[var(--btn-primary-bg)] px-5 text-[0.9375rem] font-semibold text-[var(--btn-primary-fg)] transition-colors duration-[var(--dur-hover)] hover:bg-[var(--btn-primary-bg-hover)]"
            >
              See the work
              <ArrowDown className="transition-transform duration-[var(--dur-hover)] group-hover:translate-y-0.5" />
            </a>
            <a
              href="#studio"
              className="press inline-flex h-12 items-center rounded-[var(--radius-control)] border border-[var(--btn-secondary-border)] px-5 text-[0.9375rem] font-semibold text-fg transition-colors duration-[var(--dur-hover)] hover:border-fg hover:bg-fg/[0.06]"
            >
              About the studio
            </a>
          </div>
        </div>
      </m.div>

      <div className="shell relative pb-4 pt-16 md:pb-6">
        <nav aria-label="Featured projects" className="hero-fade" style={delay(950)}>
          <ol className="grid border-t border-line-strong md:grid-cols-3">
            {featured.map((item) => (
              <li key={item.href} className="border-b border-line md:border-b-0 md:border-r md:px-5 md:first:pl-0 md:last:border-r-0">
                <a href={item.href} className="group flex min-h-16 items-baseline gap-4 py-4 md:flex-col md:gap-2 md:py-5">
                  <span className="label">{item.no}</span>{' '}
                  <span className="flex flex-1 flex-col gap-1">
                    <span className="text-[1rem] font-semibold text-fg">
                      {item.name}
                      <ArrowDown
                        size={14}
                        className="ml-2 inline-block text-fg-subtle transition-[transform,color] duration-[var(--dur-hover)] group-hover:translate-y-0.5 group-hover:text-accent"
                      />
                    </span>{' '}
                    <span className="text-small text-fg-subtle">{item.note}</span>
                  </span>
                </a>
              </li>
            ))}
          </ol>
        </nav>
        <div className="hero-fade mt-2 flex items-center justify-between gap-4" style={delay(1150)}>
          <p className="label hidden sm:block">Fig. 1: A gas giant, rendered live in your browser</p>
          <MotionToggle className="-mr-2 ml-auto" />
        </div>
      </div>
    </section>
  )
}
