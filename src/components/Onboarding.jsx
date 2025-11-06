// src/components/Onboarding.jsx
import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Map, Camera, Sparkles } from 'lucide-react'

const slides = [
  {
    title: 'TripTale',
    lead: 'Deine Reise. Deine Story.',
    text: 'Tracke deine Route live, setze Foto-Highlights und fasse alles als Story zusammen.',
    icon: Sparkles,
  },
  {
    title: 'Routen & Wegpunkte',
    lead: 'GPS-Track in Echtzeit',
    text: 'Starte mit einem Tap die Fahrt, markiere Spots und sieh die Strecke auf der Karte.',
    icon: Map,
  },
  {
    title: 'Momente festhalten',
    lead: 'Fotos + Notizen',
    text: 'Speichere Erinnerungen mit Bild & Text – später als Story/Book exportieren.',
    icon: Camera,
  },
]

export default function Onboarding({ onDone }) {
  const [i, setI] = useState(0)
  const next = () => setI(p => Math.min(p + 1, slides.length - 1))
  const prev = () => setI(p => Math.max(p - 1, 0))
  const finish = () => onDone?.()

  const { title, lead, text, icon: Icon } = slides[i]

  return (
    <div className="onboard">
      <motion.div
        className="onboard-card"
        initial={{ y: 18, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={i}
            className="onboard-inner"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
          >
            <div className="on-emoji">
              <Icon size={44} />
            </div>
            <h2 className="on-title">{title}</h2>
            <h3 className="on-lead">{lead}</h3>
            <p className="on-text">{text}</p>
          </motion.div>
        </AnimatePresence>

        <div className="on-dots">
          {slides.map((_, idx) => (
            <span key={idx} className={`dot ${idx === i ? 'active' : ''}`} />
          ))}
        </div>

        <div className="on-actions">
          {i > 0 ? (
            <button className="button ghost" onClick={prev}>Zurück</button>
          ) : (
            <button className="button ghost" onClick={finish}>Überspringen</button>
          )}
          {i < slides.length - 1 ? (
            <button className="button" onClick={next}>Weiter</button>
          ) : (
            <button className="button" onClick={finish}>Los geht’s</button>
          )}
        </div>
      </motion.div>
    </div>
  )
}
