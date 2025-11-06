import React, { useMemo, useRef } from 'react'
import * as htmlToImage from 'html-to-image'

/**
 * props:
 *  - moments: [{id,src,ts,note}]
 *  - track:   [{lat,lng,ts}] (optional)
 *  - tripName: string
 */
export default function StoryExporter({ moments = [], track = [], tripName = 'TripTale Story' }) {
  const slidesRef = useRef([])

  const slides = useMemo(() => {
    const head = {
      type: 'title',
      title: tripName,
      subtitle: `${new Date().toLocaleDateString()} • ${track.length} Punkte • ${moments.length} Fotos`,
    }
    const photoSlides = moments.slice(0, 12).map(m => ({ type: 'photo', m }))
    const tail = { type: 'outro' }
    return [head, ...photoSlides, tail]
  }, [moments, track, tripName])

  const download = async (idx) => {
    const node = slidesRef.current[idx]
    if (!node) return
    const dataUrl = await htmlToImage.toPng(node, { pixelRatio: 2 })
    const a = document.createElement('a')
    a.href = dataUrl
    a.download = `triptale-slide-${idx + 1}.png`
    a.click()
  }

  const downloadAll = async () => {
    for (let i = 0; i < slides.length; i++) {
      // kleine Pause, um Re-Renders zu vermeiden
      // eslint-disable-next-line no-await-in-loop
      await new Promise(r => setTimeout(r, 200))
      // eslint-disable-next-line no-await-in-loop
      await download(i)
    }
  }

  return (
    <section className="section">
      <h2 className="section-title">Story Export</h2>
      <div className="actions">
        <button className="button" onClick={downloadAll}>Alle Slides als PNG exportieren</button>
      </div>

      <div className="story-grid">
        {slides.map((s, idx) => (
          <div key={idx} className="story-wrapper">
            <div
              className={`story-slide ${s.type}`}
              ref={el => (slidesRef.current[idx] = el)}
              style={{ width: 270, height: 480 }}  /* 1080x1920 / 4 */
            >
              {s.type === 'title' && (
                <div className="story-title">
                  <img className="story-logo" src="/icons/triptale-globe-512.png" alt="" />
                  <h1>{s.title}</h1>
                  <p>{s.subtitle}</p>
                </div>
              )}

              {s.type === 'photo' && (
                <figure className="story-photo">
                  <img src={s.m.src} alt="" />
                  <figcaption>
                    <strong>{new Date(s.m.ts).toLocaleString()}</strong>
                    {s.m.note && <p>{s.m.note}</p>}
                  </figcaption>
                </figure>
              )}

              {s.type === 'outro' && (
                <div className="story-outro">
                  <h2>Danke, dass du mitgereist bist! ✈️</h2>
                  <p>Erstellt mit TripTale</p>
                </div>
              )}
            </div>
            <button className="button ghost sm" onClick={() => download(idx)}>Als PNG</button>
          </div>
        ))}
      </div>
    </section>
  )
}
