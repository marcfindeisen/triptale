// src/data/demos.js
// Unsplash-Placeholders (lizenzfreie Vorschaubilder)
const u = (q) => `https://source.unsplash.com/featured/800x500/?${encodeURIComponent(q)}`

export const DEMOS = [
  {
    id: 'midwest',
    title: 'USA – Midwest & Badlands',
    cover: u('south dakota badlands'),
    color: '#50c7ff',
    waypoints: [
      { lat: 43.855, lng: -102.339, img: u('badlands national park'), caption: 'Badlands National Park' },
      { lat: 43.879, lng: -103.459, img: u('mount rushmore'),        caption: 'Mount Rushmore' },
      { lat: 44.590, lng: -104.715, img: u('devils tower wyoming'),  caption: 'Devils Tower' },
      { lat: 44.428, lng: -110.588, img: u('yellowstone geyser'),    caption: 'Yellowstone' },
    ]
  },
  {
    id: 'pch',
    title: 'Pacific Coast Highway',
    cover: u('big sur california coast'),
    color: '#ffb650',
    waypoints: [
      { lat: 37.804, lng: -122.271, img: u('oakland bay area'),  caption: 'Bay Area Start' },
      { lat: 36.272, lng: -121.808, img: u('big sur highway 1'), caption: 'Big Sur' },
      { lat: 34.419, lng: -119.699, img: u('santa barbara pier'), caption: 'Santa Barbara' },
      { lat: 34.052, lng: -118.243, img: u('los angeles skyline'), caption: 'Los Angeles' },
    ]
  },
  {
    id: 'iceland',
    title: 'Island – Ringstraße',
    cover: u('iceland ring road'),
    color: '#51e1a8',
    waypoints: [
      { lat: 64.128, lng: -21.827, img: u('reykjavik iceland'),       caption: 'Reykjavík' },
      { lat: 63.881, lng: -22.442, img: u('blue lagoon iceland'),     caption: 'Blue Lagoon' },
      { lat: 63.418, lng: -19.006, img: u('vik black beach'),         caption: 'Vík – Black Beach' },
      { lat: 64.257, lng: -14.963, img: u('vatnajokull glacier'),     caption: 'Vatnajökull' },
      { lat: 65.683, lng: -18.087, img: u('akureyri iceland'),        caption: 'Akureyri' },
      { lat: 64.128, lng: -21.827, img: u('reykjavik iceland night'), caption: 'Zurück in Reykjavík' },
    ]
  }
]
