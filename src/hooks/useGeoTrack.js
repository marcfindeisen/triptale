// src/hooks/useGeoTrack.js
import { useEffect, useRef, useState } from 'react'

export default function useGeoTrack() {
  const [track, setTrack] = useState([]) // [{lat,lng,ts}]
  const [isTracking, setIsTracking] = useState(false)
  const watchIdRef = useRef(null)

  const start = () => {
    if (!navigator.geolocation) {
      alert('Geolocation wird nicht unterstützt.')
      return
    }
    if (watchIdRef.current) return

    const id = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords
        setTrack((t) => [...t, { lat, lng, ts: Date.now() }])
      },
      (err) => console.warn('Geo error', err),
      { enableHighAccuracy: true, maximumAge: 1000, timeout: 10000 }
    )
    watchIdRef.current = id
    setIsTracking(true)
  }

  const stop = () => {
    if (watchIdRef.current) {
      navigator.geolocation.clearWatch(watchIdRef.current)
      watchIdRef.current = null
    }
    setIsTracking(false)
  }

  const reset = () => setTrack([])

  useEffect(() => () => stop(), []) // cleanup on unmount

  return { track, isTracking, start, stop, reset }
}
