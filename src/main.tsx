import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import './styles/index.css'
import { App } from './App'

const container = document.getElementById('root')
if (!container) throw new Error('Missing #root')

const app = (
  <StrictMode>
    <App />
  </StrictMode>
)

// Production pages arrive prerendered (scripts/prerender.mjs), so hydrate
// them; the dev server serves an empty shell, so render from scratch.
if (container.firstElementChild) hydrateRoot(container, app)
else createRoot(container).render(app)
