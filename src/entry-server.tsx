import { StrictMode } from 'react'
import { renderToString } from 'react-dom/server'
import { App } from './App'
export { llmsText, structuredData } from './content/structured-data'
export { BUILD_DATE } from './content/site'

/** Renders the page to static HTML at build time; see scripts/prerender.mjs. */
export function render(): string {
  return renderToString(
    <StrictMode>
      <App />
    </StrictMode>,
  )
}
