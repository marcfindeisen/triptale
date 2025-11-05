import React, { useEffect, useMemo, useState } from 'react'
import Onboarding from './components/Onboarding.jsx'
import PhotoModal from './components/PhotoModal.jsx'
import BottomNav from './components/BottomNav.jsx'
import './styles.css'

// einfache lokale Speicher-Helpers
const LS = {
  get: (k, d) => {
    try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d } catch { return d }
  },
  set: (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)) } catch {} }
}

export default function App() {
  // tabs: map | moments | trips | profile
  const [tab, setTab] = useState(LS.get('tt_tab', 'map'))
  const [showOnboarding, setShowOnboarding] = useState(() => !LS.get('tt_onboarded', false))

  // Momente (Foto + Notiz)
  const [moments, setMoments] = useState(LS.get('tt_moments', []))
  useEffect(() => { LS.set('tt_moments', moments) }, [moments])
  useEffect(() => { LS.set('tt_tab', tab) }, [tab])

  // Foto-Modal (für Karten-Highlights / Momente)
  const [modal, setModal] = useState(null) // {src, title, note}
  const closeModal = () => setModal(null)

  // beim ersten Start Onboarding zeigen
  const finishOnboarding = () => {
    setShowOnboarding(false)
    LS.set('tt_onboarded', true)
  }

  // Foto hinzufügen (Momente)
  const onAddMoment = async (file) => {
    if (!file) return
    const src = URL.createObjectURL(file)
    const newItem = { id: crypto.randomUUID(), src, ts: Date.now(), note: '' }
    setMoments(m => [newItem, ...m])
    setModal({ ...newItem, title: 'Neuer Moment', note: '' })
  }

  // Notiz speichern (aus Modal)
  const saveNote = (id, note) => {
    setMoments(m => m.map(x => x.id === id ? { ...x, note } : x))
    setModal(m => m ? { ...m, note } : m)
  }

  // einfache „Trips“ – wir nehmen alle Momente als eine Reise Demo
  const trips = useMemo(() => ([
    { id: 'demo-1', name: 'USA Midwest (Demo)', points: 12, photos: moments.length }
  ]), [moments.length])

  return (
    <div className="page">
      {/* Top-Header schlicht */}
      <header className="tt-header">
        <div className="tt-brand">
          <img src="/icons/triptale-globe-192.png" alt="" />
          <span>TripTale</span>
        </div>
      </header>

      {/* Onboarding beim ersten Start */}
      {showOnboarding && <Onboarding onDone={finishOnboarding} />}

      {/* Inhalt je Tab */}
      <main className="tt-main" style={{ display: showOnboarding ? 'none' : 'block' }}>
        {tab === 'map' && <MapTab onAddMoment={onAddMoment} openPhoto={setModal} />}
        {tab === 'moments' && <MomentsTab moments={moments} onAddMoment={onAddMoment} openPhoto={setModal} />}
        {tab === 'trips' && <TripsTab trips={trips} />}
        {tab === 'profile' && <ProfileTab />}
      </main>

      {/* Bottom Nav */}
      <BottomNav value={tab} onChange={setTab} />

      {/* Foto / Highlight Modal */}
      {modal && (
        <PhotoModal
          item={modal}
          onClose={closeModal}
          onSaveNote={(note) => saveNote(modal.id, note)}
        />
      )}
    </div>
  )
}

/* ---------------- Tabs ---------------- */

function MapTab({ onAddMoment, openPhoto }) {
  // Hier sitzt deine bestehende Karte. Wir lassen den Container 100% breit & mobil-freundlich.
  return (
    <section className="section">
      <h2 className="section-title">Karte</h2>
      <div id="map" className="map">
        {/* Deine bestehende Map-Initialisierung greift auf #map zu.
            Wenn du sie in React mountest, ggf. useEffect nutzen. */}
        <div className="map-placeholder">
          <p>Deine Karte lädt hier. 👋</p>
          <p>Tipp: Klicke auf „Moment hinzufügen“, um ein Foto-Highlight anzulegen.</p>
        </div>
      </div>

      <div className="actions">
        <label className="button">
          📸 Moment hinzufügen
          <input type="file" accept="image/*" capture="environment" hidden onChange={e => onAddMoment(e.target.files?.[0])} />
        </label>
        <button className="button ghost" onClick={() => openPhoto({
          id: 'demo',
          src: '/icons/triptale-globe-512.png',
          title: 'Highlight (Demo)',
          note: 'Foto/Notiz erscheint später direkt am Wegpunkt.'
        })}>
          🎯 Highlight-Demo
        </button>
      </div>
    </section>
  )
}

function MomentsTab({ moments, onAddMoment, openPhoto }) {
  return (
    <section className="section">
      <h2 className="section-title">Momente</h2>
      <div className="actions">
        <label className="button">
          📤 Foto hochladen
          <input type="file" accept="image/*" hidden onChange={e => onAddMoment(e.target.files?.[0])} />
        </label>
      </div>
      {moments.length === 0 ? (
        <p className="muted">Noch keine Momente. Füge auf der Karte oder hier dein erstes Foto hinzu.</p>
      ) : (
        <div className="grid">
          {moments.map(m => (
            <figure key={m.id} className="card" onClick={() => openPhoto(m)}>
              <img src={m.src} alt="" />
              <figcaption>
                <div className="caption-row">
                  <strong>{new Date(m.ts).toLocaleString()}</strong>
                </div>
                {m.note ? <p className="note">{m.note}</p> : <p className="muted">Tippe, um eine Notiz zu ergänzen…</p>}
              </figcaption>
            </figure>
          ))}
        </div>
      )}
    </section>
  )
}

function TripsTab({ trips }) {
  return (
    <section className="section">
      <h2 className="section-title">Reisen</h2>
      <div className="list">
        {trips.map(t => (
          <article key={t.id} className="list-item">
            <div>
              <h3>{t.name}</h3>
              <p className="muted">{t.points} Wegpunkte · {t.photos} Fotos</p>
            </div>
            <button className="button ghost">Zusammenfassung</button>
          </article>
        ))}
      </div>
    </section>
  )
}

function ProfileTab() {
  return (
    <section className="section">
      <h2 className="section-title">Profil</h2>
      <div className="grid">
        <div className="card">
          <h3>Statistik</h3>
          <p className="muted">Demnächst: Kilometer, Länder, Städte, Trophäen.</p>
        </div>
        <div className="card">
          <h3>Einstellungen</h3>
          <ul className="muted">
            <li>Offline-Karten (bald)</li>
            <li>Export: Story/PDF (bald)</li>
            <li>Datenschutz</li>
          </ul>
        </div>
      </div>
    </section>
  )
}
