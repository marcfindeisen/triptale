// src/components/Importer.jsx
import React, { useState } from 'react'
import { readText, parseGPX, parseKML } from '../utils/geoImport.js'

export default function Importer({ onImported }) {
  const [summary, setSummary] = useState(null)
  const [name, setName] = useState('Importierte Reise')

  async function handleFile(e) {
    const file = e.target.files?.[0]
    if (!file) return
    const text = await readText(file)
    let data
    if (file.name.toLowerCase().endsWith('.gpx')) data = parseGPX(text)
    else if (file.name.toLowerCase().endsWith('.kml')) data = parseKML(text)
    else return alert('Nur .gpx oder .kml unterstützt')

    const distKm = estimateDistanceKm(data.track)
    setSummary({ ...data, distKm, fileName: file.name })
  }

  function saveTrip() {
    if (!summary) return
    onImported?.({
      name,
      track: summary.track,
      waypoints: summary.waypoints,
      meta: { type: summary.type, distKm: summary.distKm, fileName: summary.fileName },
    })
    setSummary(null)
  }

  return (
    <section className="section">
      <h2 className="section-title">GPX / KML importieren</h2>
      <div className="actions">
        <label className="button">
          Datei wählen (.gpx / .kml)
          <input type="file" accept=".gpx,.kml" hidden onChange={handleFile} />
        </label>
      </div>

      {summary && (
        <div className="card" style={{ padding: 12 }}>
          <p><strong>Quelle:</strong> {summary.fileName} ({summary.type.toUpperCase()})</p>
          <p><strong>Trackpunkte:</strong> {summary.track.length} · <strong>Wegpunkte:</strong> {summary.waypoints.length}</p>
          <p><strong>geschätzt:</strong> {summary.distKm.toFixed(1)} km Gesamtstrecke</p>
          <div className="actions">
            <input className="modal-textarea" style={{ minHeight: 0, height: 42 }}
                   value={name} onChange={e => setName(e.target.value)} />
            <button className="button" onClick={saveTrip}>Als Reise speichern</button>
          </div>
        </div>
      )}
    </section>
  )
}

/* einfache Haversine-Schätzung */
function estimateDistanceKm(track) {
  if (!track || track.length < 2) return 0
  let d = 0
  for (let i = 1; i < track.length; i++) {
    d += haversine(track[i-1], track[i])
  }
  return d
}
function haversine(a, b) {
  const R = 6371
  const dLat = toRad(b.lat - a.lat)
  const dLng = toRad(b.lng - a.lng)
  const lat1 = toRad(a.lat)
  const lat2 = toRad(b.lat)
  const x = Math.sin(dLat/2)**2 + Math.cos(lat1)*Math.cos(lat2)*Math.sin(dLng/2)**2
  return 2 * R * Math.asin(Math.sqrt(x))
}
const toRad = (x) => x * Math.PI / 180
