import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './styles.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

// Splash sanft ausblenden, wenn React geladen hat
window.requestAnimationFrame(() => {
  const el = document.getElementById('splash')
  if (el) setTimeout(() => el.classList.add('hide'), 300)
})
