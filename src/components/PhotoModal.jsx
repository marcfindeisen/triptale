import React, { useState } from 'react'

export default function PhotoModal({ item, onClose, onSaveNote }) {
  const [note, setNote] = useState(item.note || '')
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <img className="modal-img" src={item.src} alt="" />
        <h3 className="modal-title">{item.title || 'Moment'}</h3>
        <textarea
          className="modal-textarea"
          placeholder="Notiz hinzufügen…"
          value={note}
          onChange={e => setNote(e.target.value)}
        />
        <div className="actions">
          <button className="button ghost" onClick={onClose}>Schließen</button>
          <button className="button" onClick={() => { onSaveNote(note); onClose() }}>Speichern</button>
        </div>
      </div>
    </div>
  )
}
