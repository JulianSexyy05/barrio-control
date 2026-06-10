import { useState } from "react";

export default function NotesSection({ notes, onUpdate }) {
  const [newNote, setNewNote] = useState("");

  const handleAdd = () => {
    if (!newNote.trim()) return;
    onUpdate([...notes, { id: crypto.randomUUID(), text: newNote.trim() }]);
    setNewNote("");
  };

  const handleDelete = (id) => {
    onUpdate(notes.filter((n) => n.id !== id));
  };

  return (
    <section className="content-section">
      <h4 className="content-section-title">Notas</h4>
      <div className="content-list">
        {notes?.map((note) => (
          <div key={note.id} className="content-item">
            <span className="content-item-text">{note.text}</span>
            <button className="content-item-delete" onClick={() => handleDelete(note.id)} title="Eliminar nota">✕</button>
          </div>
        ))}
        {(!notes || notes.length === 0) && <p className="content-empty">Aún no hay notas</p>}
      </div>
      <div className="content-input-row">
        <input
          className="content-input" type="text" placeholder="Escribe una nota..."
          value={newNote} onChange={(e) => setNewNote(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") handleAdd(); }}
        />
        <button className="content-add-btn" onClick={handleAdd} disabled={!newNote.trim()}>+</button>
      </div>
    </section>
  );
}
