// src/data/demos.js
// Stabile Placeholder-Bilder (kein CORS/Rate-Limit)
const ph = (text) => `https://placehold.co/800x500/png?text=${encodeURIComponent(text)}`

export const DEMOS = [
  {
    id: 'midwest',
    title: 'USA – Midwest & Badlands',
    cover: ph('Badlands+Cover'),
    color: '#50c7ff',
    waypoints: [
      { lat: 43.855, lng: -102.339, img: ph('Badlands+National+Park'), caption: 'Badlands National Park' },
      { lat: 43.879, lng: -103.459, img: ph('Mount+Rushmore'),        caption: 'Mount Rushmore' },
      { lat: 44.590, lng: -104.715, img: ph('Devils+Tower'),          caption: 'Devils Tower' },
      { lat: 44.428, lng: -110.588, img: ph('Yellowstone'),           caption: 'Yellowstone' },
    ],
  },
  {
    id: 'pch',
    title: 'Pacific Coast Highway',
    cover: ph('Pacific+Coast+Highway'),
    color: '#ffb650',
    waypoints: [
      { lat: 37.804, lng: -122.271, img: ph('Bay+Area'),      caption: 'Bay Area Start' },
      { lat: 36.272, lng: -121.808, img: ph('Big+Sur'),       caption: 'Big Sur' },
      { lat: 34.419, lng: -119.699, img: ph('Santa+Barbara'), caption: 'Santa Barbara' },
      { lat: 34.052, lng: -118.243, img: ph('Los+Angeles'),   caption: 'Los Angeles' },
    ],
  },
  {
    id: 'iceland',
    title: 'Island – Ringstraße',
    cover: ph('Iceland+Ring+Road'),
    color: '#51e1a8',
    waypoints: [
      { lat: 64.128, lng: -21.827, img: ph('Reykjavik'),   caption: 'Reykjavík' },
      { lat: 63.881, lng: -22.442, img: ph('Blue+Lagoon'), caption: 'Blue Lagoon' },
      { lat: 63.418, lng: -19.006, img: ph('Vik'),         caption: 'Vík – Black Beach' },
      { lat: 64.257, lng: -14.963, img: ph('Vatnajokull'), caption: 'Vatnajökull' },
      { lat: 65.683, lng: -18.087, img: ph('Akureyri'),    caption: 'Akureyri' },
      { lat: 64.128, lng: -21.827, img: ph('Reykjavik'),   caption: 'Zurück in Reykjavík' },
    ],
  },
]
