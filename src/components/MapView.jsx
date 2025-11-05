// src/components/MapView.jsx
import React, { useEffect, useRef } from 'react'
import L from 'leaflet'

// Leaflet-Styles & Icon-Fix (wichtig für Vite)
import 'leaflet/dist/leaflet.css'
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png'
import iconUrl from 'leaflet/dist/images/marker-icon.png'
import shadowUrl from 'leaflet/dist/images/marker-shadow.png'
L.Icon.Default.mergeOptions({ iconRetinaUrl, iconUrl, shadowUrl })

/**
 * props:
 *  - demo: { waypoints: [{lat,lng,img,caption}], color?: string }
 */
export default function MapView({ demo }) {
  const containerRef = useRef(null)
  const mapRef = useRef(null)
  const layerRef = useRef(L.layerGroup())

  useEffect(() => {
    if (!containerRef.current) return

    // Karte initialisieren
    const map = L.map(containerRef.current, {
      center: [52.52, 13.405], // Berlin
      zoom: 5,
      zoomControl: true,
      preferCanvas: true,
    })
    mapRef.current = map

    // OSM Tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map)

    // Layer-Group für Route/Marker
    layerRef.current.addTo(map)

    // Resize-Handling
    const onResize = () => map.invalidateSize()
    window.addEventListener('resize', onResize)
    return () => {
      window.removeEventListener('resize', onResize)
      map.remove()
    }
  }, [])

  // Demo abspielen, wenn sich demo ändert
  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    layerRef.current.clearLayers()

    if (!demo || !demo.waypoints || demo.waypoints.length === 0) return

    const latlngs = demo.waypoints.map(w => [w.lat, w.lng])
    const route = L.polyline(latlngs, {
      color: demo.color || '#50c7ff',
      weight: 4,
    }).addTo(layerRef.current)

    map.fitBounds(route.getBounds().pad(0.2))

    // Auto-Emoji als Marker
    const car = L.marker(latlngs[0], {
      icon: L.divIcon({
        html: '🚗',
        className: 'car-icon',
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      }),
    }).addTo(layerRef.current)

    // Wegpunkte sequenziell: Auto bewegt sich, Popup mit Bild 2s
    ;(async () => {
      for (let i = 0; i < demo.waypoints.length; i++) {
        const w = demo.waypoints[i]
        car.setLatLng([w.lat, w.lng])
        map.panTo([w.lat, w.lng], { animate: true, duration: 0.8 })

        const pin = L.marker([w.lat, w.lng]).addTo(layerRef.current)
        const html = `
          <div style="max-width:260px">
            <img src="${w.img}" alt="" style="width:100%;border-radius:8px;margin-bottom:6px"/>
            <strong>${w.caption || 'Highlight'}</strong>
          </div>`
        pin.bindPopup(html, { autoPan: true, closeButton: false }).openPopup()

        await wait(2000) // 2 Sekunden warten
        pin.closePopup()
      }
    })()
  }, [demo])

  return (
    <div
      ref={containerRef}
      className="map"
      aria-label="Reisekarte"
      role="img"
    />
  )
}

const wait = (ms) => new Promise(res => setTimeout(res, ms))
