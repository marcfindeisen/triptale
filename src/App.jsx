import React, { useEffect, useMemo, useState } from 'react'
import Onboarding from './components/Onboarding.jsx'
import PhotoModal from './components/PhotoModal.jsx'
import BottomNav from './components/BottomNav.jsx'
import MapView from './components/MapView.jsx'
import { DEMOS } from './data/demos.js'
import useGeoTrack from './hooks/useGeoTrack.js'
import './styles.css'

const LS = {
  get: (k, d) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d } catch { return d } },
  set: (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)) } catch {} }
}

export default function App() {
  const [tab, setTab] = useState(LS.get('tt_tab', 'map'))
  const [showOnboarding, setShowOnboarding] = useState(() => !LS.get('tt_onboarded', false))
  const [savedTrips, setSavedTrips] = useState(LS.get('tt_trips', [])) // [{id,name,track,created}]

  // Moments
  const [moments, setMoments] = useState(LS.get('tt_moments', []))
  useEffect(() => { LS.set('tt_moments', moments) }, [moments])
  useEffect(() => { LS.set('tt_tab', tab) }, [tab])
  useEffect(() => { LS.set('tt_trips', savedTrips) }, [savedTrips])

  // Photo modal
  const [modal, setModal] = useState(null)

  // Live GPS tracking
  const { track, isTracking, start, stop, reset } = useGeoTrack()

  const finishOnboarding = () => { setShowOnboarding(false); LS.set('tt_onboarded', true) }

  const onAddMoment = async (file) => {
    if (!file) return
    const src = URL.createObjectURL(file)
    const newItem = { id: crypto.randomUUID(), src, ts: Date.now(), note: '' }
    setMoments(m => [newItem, ...m])
    setModal({ ...newItem, title: 'Neuer Moment', note: '' })
  }
  const saveNote = (id, note) => {
    setMoments(m => m.map(x => x.id === id ? { ...x, note } : x))
    setModal(m => m ? { ...m, note } : m)
  }

  // Trip speichern
  const saveCurrentTrip = () => {
    if (track.length < 2) return alert('Zu wenig Punkte zum Speichern.')
    const name = prompt('Name für diese Reise:', `Reise ${new Date().toLocaleDateString()}`)
    if (!name) return
    setSavedTrips(t => [{ id: crypto.randomUUID(), name, track, created: Date.now() }, ...t])
    reset()
    setTab('trips')
  }

  // Trip laden auf Karte
  const [loadedTripTrack, setLoadedTripTrack] = useState(null)

  return (
    <div className="page">
      <header className="tt-header">
        <div className="tt-brand">
          <img src="/icons/triptale-globe-192.png" alt="TripTale" />
          {/* Text nur für Screenreader sichtbar, visuell ausgeblendet */}
          <span className="sr-only">TripTale</span>
        </div>
      </header>

      {showOnboarding && <Onboarding onDone={finishOnboarding} />}

      <main className="tt-main" style={{ display: showOnboarding ? 'none' : 'block' }}>
        {tab === 'map' && (
          <MapTab
            onAddMoment={onAddMoment}
            openPhoto={setModal}
            liveTrack={loadedTripTrack || track}
            isTracking={isTracking}
            onStart={start}
            onStop={stop}
            onSaveTrip={saveCurrentTrip}
          />
        )}

        {tab === 'moments' && <MomentsTab moments={moments} onAddMoment={onAddMoment} openPhoto={setModal} />}

        {tab === 'trips' && (
          <TripsTab
            trips={savedTrips}
            onLoad={(trip) => { setLoadedTripTrack(trip.track); setTab('map') }}
            onDelete={(id) => setSavedTrips(t => t.filter(x => x.id !== id))}
          />
        )}

        {tab === 'profile' && <ProfileTab />}
      </main>

      <BottomNav value={tab} onChange={(v) => { if (v !== 'map') setLoadedTripTrack(null); setTab(v) }} />

      {modal && (
        <PhotoModal
          item={modal}
          onClose={() => setModal(null)}
          onSaveNote={(note) => saveNote(modal.id, note)}
        />
      )}
    </div>
  )
}

/* ---------------- Tabs ---------------- */

function MapTab({ onAddMoment, openPhoto, liveTrack, isTracking, onStart, onStop, onSaveTrip }) {
  const [activeDemo, setActiveDemo] = useState(null)

  return (
    <section className="section">
      <h2 className="section-title">Karte</h2>

      <MapView demo={activeDemo} liveTrack={activeDemo ? null : liveTrack} />

      {/* Tracking Controls */}
      <div className="actions">
        {!isTracking ? (
          <button className="button" onClick={onStart}>▶️ Neue Reise starten</button>
        ) : (
          <>
            <button className="button ghost" onClick={onStop}>⏸️ Stopp</button>
            <button className="button" onClick={onSaveTrip}>💾 Reise speichern</button>
          </>
        )}

        <label className="button">
          📸 Moment hinzufügen
          <input type="file" accept="image/*" capture="environment" hidden
                 onChange={e => onAddMoment(e.target.files?.[0])}/>
        </label>
      </div>

      {/* Demo-Strip */}
      <div className="demo-strip">
        {DEMOS.map(d => (
          <article key={d.id} className="demo-card">
            <img src={d.cover} alt="" />
            <div className="demo-body">
              <h3>{d.title}</h3>
              <button className="button" onClick={() => setActiveDemo(d)}>Demo laden</button>
            </div>
          </article>
        ))}
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

function TripsTab({ trips, onLoad, onDelete }) {
  return (
    <section className="section">
      <h2 className="section-title">Reisen</h2>
      {trips.length === 0 ? (
        <p className="muted">Noch keine gespeicherten Reisen. Starte eine neue auf der Karte.</p>
      ) : (
        <div className="list">
          {trips.map(t => (
            <article key={t.id} className="list-item">
              <div>
                <h3>{t.name}</h3>
                <p className="muted">{t.track.length} Punkte · {new Date(t.created).toLocaleString()}</p>
              </div>
              <div className="actions">
                <button className="button" onClick={() => onLoad(t)}>Anzeigen</button>
                <button className="button ghost" onClick={() => onDelete(t.id)}>Löschen</button>
              </div>
            </article>
          ))}
        </div>
      )}
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
