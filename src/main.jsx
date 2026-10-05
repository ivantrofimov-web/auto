import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import App from './App.jsx'
import { site } from './data/content.js'
import './styles.css'

const root = document.getElementById('root')
const app = (
  <StrictMode>
    <App />
  </StrictMode>
)

// В режиме разработки заголовок не подставлен пререндером
if (!document.title) document.title = site.title

// В сборке разметка уже лежит в HTML (см. scripts/prerender.mjs) — оживляем её.
if (root.firstElementChild) hydrateRoot(root, app)
else createRoot(root).render(app)
