// src/App.jsx
import React, { useEffect, useState } from 'react'
import Onboarding from './components/Onboarding.jsx'
import PhotoModal from './components/PhotoModal.jsx'
import BottomNav from './components/BottomNav.jsx'
import MapView from './components/MapView.jsx'
import StoryExporter from './components/StoryExporter.jsx'
import Importer from './components/Importer.jsx'
import PdfExporter from './components/PdfExporter.jsx'
import StoryVideoExporter from './components/StoryVideoExporter.jsx'
import { DEMOS } from './data/demos.js'
import useGeoTrack from './hooks/useGeoTrack.js'
import './styles.css'

const LS = {
  get: (k, d) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d } catch { return d } },
  set: (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)) } catch {} }
}

export default function App() {
  // Tabs & Onboarding
  const [tab, setTab] = useState(LS.get('tt_tab', 'map'))
  const [showOnboarding, setShowOnboarding] = useState(() => !LS.get('tt_onboarded', false))
  const finishOnboarding = () => { setShowOnboarding(false); LS.set('tt_onboarded', true) }

  // Daten
  const [savedTrips, setSavedTrips] = useState(LS.get('tt_trips', []))           // [{id,name,track,created,waypoints?,meta?}]
  const [moments, setMoments] = useState(LS.get('tt_moments', []))               // [{id,src,ts,note}]
  const [stickers, setStickers] = useState(LS.get('tt_stickers', []))            // [{id,lat,lng,emoji}]
  const [loadedTripTrack, setLoadedTripTrack] = useState(null)                   // aktuell geladene Reise → Map
  const [activeSticker, setActiveSticker] = useState(null)                       // UI-Auswahl für Emojis

  useEffect(() => { LS.set('tt_tab', tab) }, [tab])
  useEffect(() => { LS.set('tt_trips', savedTrips) }, [savedTrips])
  useEffect(() => { LS.set('tt_moments', moments) }, [moments])
  useEffect(() => { LS.set('tt_stickers', stickers) }, [stickers])

  // Foto-Modal
  const [modal, setModal] = useState(null)

  // Live GPS tracking
  const { track, isTracking, start, stop, reset } = useGeoTrack()

  // Moments
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

  // Trips
  const saveCurrentTrip = () => {
    const t = loadedTripTrack || track
    if (!t || t.length < 2) return alert('Zu wenig Punkte zum Speichern.')
    const name = prompt('Name für diese Reise:', `Reise ${new Date().toLocaleDateString()}`)
    if (!name) return
    setSavedTrips(v => [{ id: crypto.randomUUID(), name, track: t, created: Date.now() }, ...v])
    reset()
    setLoadedTripTrack(null)
    setTab('trips')
  }

  const stickerChoices = ['📍','✈️','🚗','🏕️','🏖️','🍽️','⛷️','🏰','🛳️','📸']

  return (
    <div className="page">
      {/* Header */}
      <header className="tt-header fancy">
        <div className="tt-brand">
          <img src="/icons/triptale-globe-192.png" alt="TripTale" />
          <span className="sr-only">TripTale</span>
        </div>
        <div className="tt-spark" aria-hidden />
      </header>

      {/* Onboarding Intro */}
      {showOnboarding && <Onboarding onDone={finishOnboarding} />}

      {/* Hauptinhalt */}
      <main className="tt-main" style={{ display: showOnboarding ? 'none' : 'block' }}>
        {tab === 'map' && (
          <section className="section">
            <h2 className="section-title">Karte</h2>

            <MapView
              demo={null}
              liveTrack={loadedTripTrack || track}
              stickers={stickers}
              activeSticker={activeSticker}
              onStickersChange={setStickers}
            />

            {/* Tracking-Buttons */}
            <div className="actions">
              {!isTracking ? (
                <button className="button" onClick={start}>▶️ Neue Reise starten</button>
              ) : (
                <>
                  <button className="button ghost" onClick={stop}>⏸️ Stopp</button>
                  <button className="button" onClick={saveCurrentTrip}>💾 Reise speichern</button>
                </>
              )}

              <label className="button">
                📸 Moment hinzufügen
                <input type="file" accept="image/*" capture="environment" hidden
                       onChange={e => onAddMoment(e.target.files?.[0])}/>
              </label>
            </div>

            {/* Sticker-Palette */}
            <div className="sticker-bar">
              <div className="sticker-row">
                {stickerChoices.map(em => (
                  <button
                    key={em}
                    className={`sticker-btn ${activeSticker === em ? 'active' : ''}`}
                    onClick={() => setActiveSticker(activeSticker === em ? null : em)}
                    title="Sticker setzen: Karte tippen"
                  >
                    {em}
                  </button>
                ))}
                <button className="sticker-btn clear" onClick={() => setActiveSticker(null)}>×</button>
              </div>
              <p className="muted">
                Tipp: Sticker aktivieren und dann auf die Karte tippen. Drag = verschieben, Rechtsklick/Langdruck = löschen.
              </p>
            </div>

            {/* Demo-Routen (laden als Track) */}
            <div className="demo-strip">
              {DEMOS.map(d => (
                <article key={d.id} className="demo-card">
                  <img src={d.cover} alt="" />
                  <div className="demo-body">
                    <h3>{d.title}</h3>
                    <button
                      className="button"
                      onClick={() => {
                        const t = d.waypoints.map(w => ({ lat: w.lat, lng: w.lng, ts: null }))
                        setLoadedTripTrack(t)
                      }}
                    >
                      Demo laden
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        {tab === 'moments' && (
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
                  <figure key={m.id} className="card" onClick={() => setModal(m)}>
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
        )}

        {tab === 'trips' && (
          <section className="section">
            <h2 className="section-title">Reisen</h2>
            {savedTrips.length === 0 ? (
              <p className="muted">Noch keine gespeicherten Reisen. Starte eine neue auf der Karte.</p>
            ) : (
              <div className="list">
                {savedTrips.map(t => (
                  <article key={t.id} className="list-item">
                    <div>
                      <h3>{t.name}</h3>
                      <p className="muted">
                        {t.track.length} Punkte · {new Date(t.created).toLocaleString()}
                      </p>
                    </div>
                    <div className="actions">
                      <button className="button" onClick={() => { setLoadedTripTrack(t.track); setTab('map') }}>
                        Anzeigen
                      </button>
                      <button className="button ghost" onClick={() => setSavedTrips(v => v.filter(x => x.id !== t.id))}>
                        Löschen
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}

            {/* GPX/KML Importer */}
            <Importer onImported={(trip) => {
              setSavedTrips(v => [
                { id: crypto.randomUUID(), name: trip.name, track: trip.track, created: Date.now(), waypoints: trip.waypoints, meta: trip.meta },
                ...v
              ])
              alert('Import erfolgreich gespeichert – unter Reisen verfügbar.')
            }} />

            <div className="actions">
              <button className="button" onClick={() => setTab('story')}>📱 Story erstellen</button>
            </div>
          </section>
        )}

        {tab === 'story' && (
          <>
            <StoryExporter
              moments={moments}
              track={loadedTripTrack || track}
              tripName="TripTale – Meine Reise"
            />

            {/* PDF Export */}
            <PdfExporter
              tripName="TripTale – Meine Reise"
              moments={moments}
              track={loadedTripTrack || track}
            />

            {/* Story-Video Export */}
            <StoryVideoExporter
              moments={moments}
              title="TripTale Story"
            />
          </>
        )}

        {tab === 'profile' && (
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
                  <li>Export: Story/PDF/Video</li>
                  <li>Datenschutz</li>
                </ul>
              </div>
            </div>
          </section>
        )}
      </main>

      {/* Bottom Navigation (Icon-basiert) */}
      <BottomNav value={tab} onChange={(v) => setTab(v)} />

      {/* Foto-Modal */}
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
