// src/components/PdfExporter.jsx
import React from 'react'
import { jsPDF } from 'jspdf'

/**
 * props:
 *  - tripName, moments: [{src,ts,note}], track: [{lat,lng,ts}]
 */
export default function PdfExporter({ tripName='TripTale Reise', moments=[], track=[] }) {
  const makePdf = async () => {
    const pdf = new jsPDF({ unit: 'pt', format: 'a4' }) // 595x842
    const W = 595, H = 842, M = 32

    // Cover
    pdf.setFillColor(11, 18, 32)
    pdf.rect(0, 0, W, H, 'F')
    pdf.addImage('/icons/triptale-globe-512.png', 'PNG', W/2-40, 80, 80, 80, undefined, 'FAST')
    pdf.setTextColor(231, 234, 243)
    pdf.setFont('helvetica', 'bold'); pdf.setFontSize(24)
    pdf.text(tripName, W/2, 200, { align: 'center' })
    pdf.setFont('helvetica', 'normal'); pdf.setFontSize(12)
    pdf.text(`${new Date().toLocaleDateString()} • Trackpunkte: ${track.length} • Fotos: ${moments.length}`, W/2, 220, { align: 'center' })
    pdf.setDrawColor(80,199,255); pdf.line(M, 260, W-M, 260)
    pdf.setFontSize(11); pdf.text('Erstellt mit TripTale', W/2, H-40, { align: 'center' })

    // Fotos (2 pro Seite)
    let y = 80, count = 0
    for (const m of moments) {
      if (count % 2 === 0) { pdf.addPage(); y = 60 }
      try {
        const img = await loadImage(m.src)
        const ratio = img.width / img.height
        const w = W - 2*M, h = Math.min(300, (W - 2*M) / ratio)
        pdf.addImage(img, 'JPEG', M, y, w, h, undefined, 'FAST')
        y += h + 10
      } catch {}
      pdf.setFont('helvetica', 'bold'); pdf.setFontSize(12)
      pdf.text(new Date(m.ts).toLocaleString(), M, y)
      if (m.note) {
        pdf.setFont('helvetica', 'normal'); pdf.setFontSize(11)
        pdf.text(pdf.splitTextToSize(m.note, W - 2*M), M, y + 16)
        y += 50
      } else {
        y += 24
      }
      count++
    }

    pdf.save(`${safe(tripName)}.pdf`)
  }

  return (
    <section className="section">
      <h2 className="section-title">PDF Export</h2>
      <div className="actions">
        <button className="button" onClick={makePdf}>PDF erstellen</button>
      </div>
      <p className="muted">Erzeugt eine A4-PDF mit Cover, Foto-Seiten und Notizen.</p>
    </section>
  )
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
const safe = (s) => s.replace(/[^\w\-]+/g, '_')
