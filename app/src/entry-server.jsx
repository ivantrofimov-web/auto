import { StrictMode } from 'react'
import { renderToString } from 'react-dom/server'
import App from './App.jsx'
import { site } from './data/content.js'

export const meta = { title: site.title, description: site.description }

export function render() {
  return renderToString(
    <StrictMode>
      <App />
    </StrictMode>,
  )
}
