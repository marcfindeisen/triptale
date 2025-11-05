import React from 'react'

export default function BottomNav({ value, onChange }) {
  const items = [
    { key: 'map',     label: 'Karte',    icon: '🗺️' },
    { key: 'moments', label: 'Momente',  icon: '📸' },
    { key: 'trips',   label: 'Reisen',   icon: '📒' },
    { key: 'profile', label: 'Profil',   icon: '⚙️' },
  ]
  return (
    <>
      <div style={{ height: 64 }} aria-hidden="true" /> {/* spacer */}
      <nav className="bottom-nav" role="tablist" aria-label="Hauptnavigation">
        {items.map(it => (
          <button
            key={it.key}
            role="tab"
            aria-selected={value === it.key}
            className={'bottom-nav-btn' + (value === it.key ? ' active' : '')}
            onClick={() => onChange(it.key)}
          >
            <span className="nav-icon">{it.icon}</span>
            <span className="nav-label">{it.label}</span>
          </button>
        ))}
      </nav>
    </>
  )
}
