import React from 'react'
import { Map as MapIcon, Images, Briefcase, Clapperboard } from 'lucide-react'

export default function BottomNav({ value, onChange }) {
  const items = [
    { id: 'map',     label: 'Karte',   Icon: MapIcon },
    { id: 'moments', label: 'Momente', Icon: Images },
    { id: 'trips',   label: 'Reisen',  Icon: Briefcase },
    { id: 'story',   label: 'Story',   Icon: Clapperboard },
  ]

  return (
    <nav className="bottom-nav">
      {items.map(({ id, label, Icon }) => {
        const active = value === id
        return (
          <button
            key={id}
            className={`bottom-nav-btn ${active ? 'active' : ''}`}
            onClick={() => onChange(id)}
            aria-current={active ? 'page' : undefined}
          >
            <Icon className="nav-icon" strokeWidth={active ? 2.5 : 2} />
            <span className="nav-label">{label}</span>
          </button>
        )
      })}
    </nav>
  )
}
