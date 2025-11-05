import React, { useState } from 'react'

const slides = [
  {
    title: 'Reisen tracken',
    text: 'TripTale zeichnet deine Route per GPS auf – und setzt Highlights automatisch.',
    emoji: '📍'
  },
  {
    title: 'Momente festhalten',
    text: 'Füge Fotos & Notizen hinzu. Direkt an der Karte, genau am Ort.',
    emoji: '📸'
  },
  {
    title: 'Teilen & Erinnern',
    text: 'Erstelle Storys oder ein Reise-Buch – in Sekunden.',
    emoji: '✨'
  }
]

export default function Onboarding({ onDone }) {
  const [i, setI] = useState(0)
  const next = () => (i < slides.length - 1 ? setI(i + 1) : onDone())
  const skip = onDone

  return (
    <div className="onboard">
      <div className="onboard-card">
        <div className="on-emoji">{slides[i].emoji}</div>
        <h2>{slides[i].title}</h2>
        <p className="muted">{slides[i].text}</p>
        <div className="on-actions">
          <button className="button ghost" onClick={skip}>Überspringen</button>
          <button className="button" onClick={next}>{i < slides.length - 1 ? 'Weiter' : 'Los geht’s'}</button>
        </div>
        <div className="on-dots">
          {slides.map((_, idx) => <span key={idx} className={'dot' + (i === idx ? ' active' : '')} />)}
        </div>
      </div>
    </div>
  )
}
