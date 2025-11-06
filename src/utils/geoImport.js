// src/utils/geoImport.js
export async function readText(file) {
  const buf = await file.arrayBuffer()
  return new TextDecoder('utf-8').decode(buf)
}

export function parseGPX(xmlString) {
  const doc = new DOMParser().parseFromString(xmlString, 'application/xml')
  const ns = (q) => doc.getElementsByTagName(q)

  // Trackpunkte
  const trkpts = Array.from(doc.getElementsByTagName('trkpt'))
  const track = trkpts.map(pt => ({
    lat: parseFloat(pt.getAttribute('lat')),
    lng: parseFloat(pt.getAttribute('lon')),
    ts: timeFrom(pt.getElementsByTagName('time')[0]?.textContent),
  }))

  // Wegpunkte (wpt)
  const wpts = Array.from(doc.getElementsByTagName('wpt'))
  const waypoints = wpts.map(w => ({
    lat: parseFloat(w.getAttribute('lat')),
    lng: parseFloat(w.getAttribute('lon')),
    name: textOf(w, 'name') || 'Waypoint',
    desc: textOf(w, 'desc') || '',
  }))

  return { type: 'gpx', track, waypoints }
}

export function parseKML(xmlString) {
  const doc = new DOMParser().parseFromString(xmlString, 'application/xml')

  // Linien (gx:Track oder LineString)
  let track = []
  // 1) gx:Track (coord oder when)
  const gx = 'http://www.google.com/kml/ext/2.2'
  const kmlNs = 'http://www.opengis.net/kml/2.2'
  const tracks = doc.getElementsByTagNameNS(gx, 'Track')
  if (tracks.length) {
    const coords = Array.from(tracks[0].getElementsByTagNameNS(gx, 'coord'))
    const times = Array.from(tracks[0].getElementsByTagNameNS(kmlNs, 'when'))
    track = coords.map((c, i) => {
      const [lng, lat] = c.textContent.trim().split(' ').map(parseFloat)
      return { lat, lng, ts: timeFrom(times[i]?.textContent) }
    })
  } else {
    // 2) LineString
    const line = doc.getElementsByTagName('LineString')[0]
    if (line) {
      const coords = line.getElementsByTagName('coordinates')[0]?.textContent || ''
      track = coords.split(/\s+/).map(s => s.trim()).filter(Boolean).map(s => {
        const [lng, lat] = s.split(',').map(Number)
        return { lat, lng, ts: null }
      })
    }
  }

  // Placemark Punkte
  const placemarks = Array.from(doc.getElementsByTagName('Placemark'))
  const waypoints = placemarks.flatMap(pm => {
    const name = pm.getElementsByTagName('name')[0]?.textContent ?? 'Placemark'
    const point = pm.getElementsByTagName('Point')[0]
    if (!point) return []
    const coord = point.getElementsByTagName('coordinates')[0]?.textContent?.trim()
    if (!coord) return []
    const [lng, lat] = coord.split(',').map(Number)
    return [{ lat, lng, name, desc: '' }]
  })

  return { type: 'kml', track, waypoints }
}

/* helpers */
function timeFrom(s) {
  if (!s) return null
  const t = Date.parse(s)
  return Number.isFinite(t) ? t : null
}
function textOf(node, tag) {
  return node?.getElementsByTagName(tag)[0]?.textContent ?? ''
}
