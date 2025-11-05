import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './styles.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

// Splashscreen-Steuerung: bleibt min. 1,2 s sichtbar, blendet weich aus
;(function manageSplash() {
  const el = document.getElementById('splash')
  if (!el) return

  const MIN_VISIBLE_MS = 1200 // Mindestdauer sichtbar (ms)
  const start = performance.now()

  function hideSplash() {
    const elapsed = performance.now() - start
    const wait = Math.max(0, MIN_VISIBLE_MS - elapsed)
    setTimeout(() => el.classList.add('hide'), wait)
  }

  // Wenn alles geladen → ausblenden
  if (document.readyState === 'complete') {
    hideSplash()
  } else {
    window.addEventListener('load', hideSplash, { once: true })
  }

  // Fallback: max. 3 s
  setTimeout(hideSplash, 3000)
})()
