import { BUILD_DATE, links, sections } from '../../content/site'
import { projects } from '../../content/projects'
import { Mark } from '../brand/Mark'
import { ArrowUp, ArrowUpRight, GitHub } from '../ui/Icon'

// The day this build shipped, in words: 24 September 2026.
const updated = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${BUILD_DATE}T00:00:00Z`))

const elsewhere = [
  { label: 'GitHub', href: links.github },
  { label: 'ARC Prize 2026 on Kaggle', href: links.kaggleCompetition },
  { label: 'ARC-AGI-3', href: links.arcAgi3 },
  { label: 'Jovian Engine source', href: links.engineRepo },
]

const linkClass = 'inline-flex min-h-9 items-center gap-1.5 text-small text-fg-muted transition-colors duration-[var(--dur-hover)] hover:text-fg'

export function SiteFooter() {
  return (
    <footer className="relative border-t border-line-strong pt-16 md:pt-24" aria-labelledby="footer-title">
      <div className="shell">
        <div className="grid-12 gap-y-12">
          <div className="col-span-4 flex flex-col gap-5 md:col-span-4">
            <h2 id="footer-title" className="flex items-center gap-3">
              <Mark size={28} className="text-fg" />
              <span translate="no" className="font-bold uppercase tracking-[0.12em] [font-stretch:125%]">Jovian Games</span>
            </h2>
            <p className="max-w-[30ch] text-fg-muted">Games, the engine they run on, and AI that learns to play them.</p>
            <a href={links.github} target="_blank" rel="noopener noreferrer" className="group inline-flex min-h-11 w-fit items-center gap-2.5 text-small font-semibold text-fg">
              <GitHub />
              Everything we make is on GitHub
              <ArrowUpRight size={14} className="transition-transform group-hover:-translate-y-px group-hover:translate-x-px" />
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
          </div>

          <nav aria-label="Footer" className="col-span-4 grid grid-cols-2 gap-x-[var(--gutter)] gap-y-10 md:col-span-8 md:grid-cols-3">
            <div className="flex flex-col gap-3">
              <h3 className="label">Studio</h3>
              <ul>
                {sections.map((section) => (
                  <li key={section.id}>
                    <a href={`#${section.id}`} className={linkClass}>
                      {section.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex flex-col gap-3">
              <h3 className="label">Projects</h3>
              <ul>
                {projects
                  .filter((project) => project.id !== 'cards-3d' && project.id !== 'skyward')
                  .map((project) => {
                    const href = project.links[0]!.href
                    return (
                      <li key={project.id}>
                        <a href={href} target="_blank" rel="noopener noreferrer" className={linkClass}>
                          {project.name}
                          <span className="sr-only"> (opens in a new tab)</span>
                        </a>
                      </li>
                    )
                  })}
              </ul>
            </div>
            <div className="col-span-2 flex flex-col gap-3 md:col-span-1">
              <h3 className="label">Elsewhere</h3>
              <ul>
                {elsewhere.map((link) => (
                  <li key={link.href}>
                    <a href={link.href} target="_blank" rel="noopener noreferrer" className={linkClass}>
                      {link.label}
                      <ArrowUpRight size={12} className="text-fg-subtle" />
                      <span className="sr-only"> (opens in a new tab)</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </nav>
        </div>

        {/* The address, as the last word: sized to its column, and free to wrap after the dot
            only if the reader's own spacing settings no longer let it fit on one line. */}
        <a
          href={links.home}
          className="group @container mt-20 block border-t border-line pt-6 md:mt-28"
          aria-label="joviangame.me, the Jovian Games home page"
        >
          <span translate="no" className="block text-[min(12.5rem,calc(100cqi/8.7))] font-semibold [overflow-wrap:anywhere] lowercase leading-[0.9] tracking-[-0.02em] text-fg-faint transition-colors duration-500 ease-[var(--ease-out)] [font-stretch:118%] group-hover:text-fg">
            joviangame<span className="text-accent">.</span>
            <wbr />
            me
          </span>
        </a>

        <div className="flex flex-col gap-4 py-8 text-small text-fg-subtle md:flex-row md:items-center md:justify-between">
          {/* Stamped at build time; if the client bundle was built a day later, the server's date stands. */}
          <p suppressHydrationWarning>
            ©&nbsp;{BUILD_DATE.slice(0, 4)} Jovian Games. Set in Archivo and Martian Mono. Updated{' '}
            <time dateTime={BUILD_DATE} suppressHydrationWarning>
              {updated}
            </time>
            .
          </p>
          <p className="max-w-[60ch]">Cards Against The Humanity is an unofficial fan project, not affiliated with Cards Against Humanity LLC.</p>
          <a href="#top" className="press inline-flex min-h-11 w-fit items-center gap-2 font-medium text-fg-muted transition-colors hover:text-fg">
            Back to top
            <ArrowUp size={14} />
          </a>
        </div>
      </div>
    </footer>
  )
}
