import { lazy, Suspense } from 'react'
import { LazyMotion } from 'motion/react'
import { loadProjectIndex, loadProjectSheet, UIProvider, useUI } from './app/ui'
import { SiteFooter } from './components/layout/SiteFooter'
import { SiteHeader } from './components/layout/SiteHeader'
import { useCanvasTheme, useRevealObserver } from './hooks/usePageObservers'
import { Archive } from './sections/Archive'
import { Cards } from './sections/Cards'
import { Engine } from './sections/Engine'
import { Hero } from './sections/Hero'
import { Lab } from './sections/Lab'
import { Research } from './sections/Research'
import { Studio } from './sections/Studio'

const loadMotionFeatures = () => import('./lib/motion-features').then((module) => module.default)

const ProjectIndex = lazy(loadProjectIndex)
const ProjectSheet = lazy(loadProjectSheet)

/** The two overlays load on first use (and are preloaded on intent). */
function Overlays() {
  const {
    state: { indexOpen, projectId },
  } = useUI()
  return (
    <Suspense fallback={null}>
      {indexOpen ? <ProjectIndex /> : null}
      {projectId ? <ProjectSheet /> : null}
    </Suspense>
  )
}

function PageEffects() {
  useRevealObserver()
  useCanvasTheme()
  return null
}

export function App() {
  return (
    <UIProvider>
      <LazyMotion features={loadMotionFeatures} strict>
      <PageEffects />
      <div id="page">
        <a
          href="#main"
          className="sr-only-focusable fixed left-4 top-4 z-[100] rounded-[var(--radius-control)] bg-[var(--btn-primary-bg)] px-4 py-3 font-semibold text-[var(--btn-primary-fg)]"
        >
          Skip to content
        </a>
        <SiteHeader />
        <main id="main" tabIndex={-1} className="outline-none">
          <Hero />
          <Studio />
          <Engine />
          <Cards />
          <Research />
          <Lab />
          <Archive />
        </main>
        <SiteFooter />
      </div>
      <Overlays />
      </LazyMotion>
    </UIProvider>
  )
}
