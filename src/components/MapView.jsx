// src/components/MapView.jsx
import React, { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png'
import iconUrl from 'leaflet/dist/images/marker-icon.png'
import shadowUrl from 'leaflet/dist/images/marker-shadow.png'
L.Icon.Default.mergeOptions({ iconRetinaUrl, iconUrl, shadowUrl })

/**
 * props:
 *  - demo: { waypoints:[{lat,lng,img,caption}], color? }
 *  - liveTrack: [{lat,lng}]  // aktuelle Positionsliste, wird als Polyline gezeichnet
 */
export default function MapView({ demo, liveTrack }) {
  const elRef = useRef(null)
  const mapRef = useRef(null)
  const layerRef = useRef(L.layerGroup())
  const liveLayerRef = useRef(L.layerGroup())

  useEffect(() => {
    if (!elRef.current) return
    const map = L.map(elRef.current, {
      center: [52.52, 13.405],
      zoom: 5,
      zoomControl: true,
      preferCanvas: true,
    })
    mapRef.current = map

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map)

    layerRef.current.addTo(map)
    liveLayerRef.current.addTo(map)

    const onResize = () => map.invalidateSize()
    window.addEventListener('resize', onResize)
    return () => {
      window.removeEventListener('resize', onResize)
      map.remove()
    }
  }, [])

  // Live-Tracking Polyline
  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    liveLayerRef.current.clearLayers()
    if (!liveTrack || liveTrack.length < 2) return

    const latlngs = liveTrack.map(p => [p.lat, p.lng])
    const poly = L.polyline(latlngs, { color: '#7dd3fc', weight: 4 }).addTo(liveLayerRef.current)
    L.marker(latlngs[latlngs.length - 1], {
      icon: L.divIcon({ html: '🧭', className: 'car-icon', iconSize: [24, 24], iconAnchor: [12, 12] }),
    }).addTo(liveLayerRef.current)
    map.fitBounds(poly.getBounds().pad(0.2))
  }, [liveTrack])

  // Demo abspielen
  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    layerRef.current.clearLayers()

    if (!demo || !demo.waypoints?.length) return

    const latlngs = demo.waypoints.map(w => [w.lat, w.lng])
    const route = L.polyline(latlngs, { color: demo.color || '#50c7ff', weight: 4 }).addTo(layerRef.current)
    map.fitBounds(route.getBounds().pad(0.2))

    const car = L.marker(latlngs[0], {
      icon: L.divIcon({ html: '🚗', className: 'car-icon', iconSize: [24, 24], iconAnchor: [12, 12] }),
    }).addTo(layerRef.current)

    ;(async () => {
      for (let i = 0; i < demo.waypoints.length; i++) {
        const w = demo.waypoints[i]
        car.setLatLng([w.lat, w.lng])
        map.panTo([w.lat, w.lng], { animate: true, duration: 0.8 })

        const pin = L.marker([w.lat, w.lng]).addTo(layerRef.current)
        const html = `
          <div style="max-width:260px">
            <img src="${w.img}" alt="" style="width:100%;border-radius:8px;margin-bottom:6px"
                 onerror="this.src='https://placehold.co/800x500/png?text=Foto'"/>
            <strong>${w.caption || 'Highlight'}</strong>
          </div>`
        pin.bindPopup(html, { autoPan: true, closeButton: false }).openPopup()
        await wait(2000)
        pin.closePopup()
      }
    })()
  }, [demo])

  return <div ref={elRef} className="map" aria-label="Reisekarte" role="img" />
}
const wait = (ms) => new Promise((res) => setTimeout(res, ms))
