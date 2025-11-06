// src/components/StoryVideoExporter.jsx
import React, { useRef, useState } from 'react'

/**
 * Nimmt die gleichen Daten wie die Story-Slides:
 *  - moments [{src,ts,note}]
 *  - title string
 * Export: WebM (VP9) per MediaRecorder eines Canvas-Streams
 */
export default function StoryVideoExporter({ moments = [], title = 'TripTale Story' }) {
  const canvasRef = useRef(null)
  const [busy, setBusy] = useState(false)

  const exportVideo = async () => {
    if (!canvasRef.current) return
    setBusy(true)

    const cv = canvasRef.current
    const ctx = cv.getContext('2d')
    const width = 1080, height = 1920
    cv.width = width; cv.height = height

    const stream = cv.captureStream(30) // 30fps
    const recorder = new MediaRecorder(stream, { mimeType: 'video/webm;codecs=vp9' })
    const chunks = []
    recorder.ondataavailable = e => e.data.size && chunks.push(e.data)
    const done = new Promise(res => recorder.onstop = res)
    recorder.start(100)

    // Intro
    await drawIntro(ctx, width, height, title)
    await sleep(600)

    // Fotos
    for (const m of moments) {
      const img = await loadImage(m.src)
      await drawPhotoSlide(ctx, width, height, img, m)
      await sleep(1200) // Dauer je Slide
    }

    // Outro
    await drawOutro(ctx, width, height)
    await sleep(700)

    recorder.stop()
    await done
    const blob = new Blob(chunks, { type: 'video/webm' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'triptale-story.webm'; a.click()
    setBusy(false)
  }

  return (
    <section className="section">
      <h2 className="section-title">Story-Video (WebM)</h2>
      <div className="actions">
        <button className="button" onClick={exportVideo} disabled={busy}>
          {busy ? 'Rendern…' : 'Video exportieren'}
        </button>
      </div>
      <canvas ref={canvasRef} style={{ width: 270, height: 480, borderRadius: 16, border: '1px solid rgba(255,255,255,.14)' }} />
      <p className="muted">Exportiert ein vertikales WebM-Video (1080×1920) aus deinen Slides.</p>
    </section>
  )
}

/* Zeichen-Helpers */
async function drawIntro(ctx, W, H, title) {
  gradientBg(ctx, W, H)
  ctx.fillStyle = '#e7eaf3'
  ctx.textAlign = 'center'
  ctx.font = 'bold 64px system-ui'
  ctx.fillText(title, W/2, H/2 - 20)
  ctx.font = '24px system-ui'
  ctx.fillText('Erstellt mit TripTale', W/2, H/2 + 24)
}
async function drawOutro(ctx, W, H) {
  gradientBg(ctx, W, H)
  ctx.fillStyle = '#e7eaf3'; ctx.textAlign = 'center'
  ctx.font = 'bold 54px system-ui'
  ctx.fillText('Danke fürs Mitreisen!', W/2, H/2)
}
async function drawPhotoSlide(ctx, W, H, img, m) {
  gradientBg(ctx, W, H)
  const targetH = Math.floor(H * 0.68)
  const ratio = img.width / img.height
  const w = Math.min(W*0.92, targetH*ratio)
  const h = w / ratio
  const x = (W - w) / 2
  const y = 80
  ctx.drawImage(img, x, y, w, h)
  // Caption
  ctx.fillStyle = '#e7eaf3'
  ctx.font = 'bold 30px system-ui'
  ctx.fillText(new Date(m.ts).toLocaleString(), W/2, y + h + 50)
  if (m.note) {
    ctx.font = '24px system-ui'
    wrapText(ctx, m.note, W/2, y + h + 90, W*0.85)
  }
}
function gradientBg(ctx, W, H) {
  const g1 = ctx.createRadialGradient(W*0.8, H*0.2, 0, W*0.8, H*0.2, W*0.6)
  g1.addColorStop(0, 'rgba(91,140,255,0.35)')
  g1.addColorStop(1, 'rgba(11,18,32,1)')
  ctx.fillStyle = g1
  ctx.fillRect(0, 0, W, H)
  const g2 = ctx.createRadialGradient(W*0.2, H*0.9, 0, W*0.2, H*0.9, W*0.7)
  g2.addColorStop(0, 'rgba(56,231,255,0.25)')
  g2.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = g2
  ctx.fillRect(0, 0, W, H)
}
function wrapText(ctx, text, x, y, maxW, lineH=28) {
  ctx.textAlign = 'center'
  const words = text.split(' ')
  let line = ''
  for (let n=0; n<words.length; n++) {
    const test = line + words[n] + ' '
    if (ctx.measureText(test).width > maxW && n>0) {
      ctx.fillText(line, x, y); line = words[n] + ' '; y += lineH
    } else { line = test }
  }
  ctx.fillText(line, x, y)
}
function loadImage(src) {
  return new Promise((res, rej) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => res(img)
    img.onerror = rej
    img.src = src
  })
}
const sleep = (ms) => new Promise(r => setTimeout(r, ms))
