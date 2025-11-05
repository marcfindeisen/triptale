import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './styles.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

// Splash: min. 2 s sichtbar, dann sanft ausblenden
;(function manageSplash() {
  const el = document.getElementById('splash')
  if (!el) return

  const MIN_VISIBLE_MS = 2000
  const start = performance.now()

  function hideSplash() {
    const elapsed = performance.now() - start
    const wait = Math.max(0, MIN_VISIBLE_MS - elapsed)
    setTimeout(() => el.classList.add('hide'), wait)
  }

  if (document.readyState === 'complete') hideSplash()
  else window.addEventListener('load', hideSplash, { once: true })

  // Fallback nach 5 s
  setTimeout(hideSplash, 5000)
})()
