import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './styles.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

// Splash: mind. 1,8 s sichtbar, erst nach 'load' weich ausblenden
;(function manageSplash() {
  const el = document.getElementById('splash')
  if (!el) return

  const MIN_VISIBLE_MS = 1800  // hier Dauer anpassen (z.B. 2000 für 2 s)
  const start = performance.now()

  function hideSplash() {
    const elapsed = performance.now() - start
    const wait = Math.max(0, MIN_VISIBLE_MS - elapsed)
    setTimeout(() => el.classList.add('hide'), wait)
  }

  if (document.readyState === 'complete') {
    hideSplash()
  } else {
    window.addEventListener('load', hideSplash, { once: true })
  }

  // Hard-Fallback (falls 'load' nie kommt)
  setTimeout(hideSplash, 5000)
})()
