import { useState } from "react";

export default function ProjectContent({ project, onUpdate }) {
  const [newNote, setNewNote] = useState("");
  const [newLinkTitle, setNewLinkTitle] = useState("");
  const [newLinkUrl, setNewLinkUrl] = useState("");

  const handleAddNote = () => {
    if (!newNote.trim()) return;
    onUpdate({
      ...project,
      notas: [...project.notas, { id: Date.now(), text: newNote.trim() }],
    });
    setNewNote("");
  };

  const handleDeleteNote = (noteId) => {
    onUpdate({
      ...project,
      notas: project.notas.filter((n) => n.id !== noteId),
    });
  };

  const handleAddLink = () => {
    if (!newLinkTitle.trim() || !newLinkUrl.trim()) return;
    onUpdate({
      ...project,
      links: [
        ...project.links,
        { id: Date.now(), title: newLinkTitle.trim(), url: newLinkUrl.trim() },
      ],
    });
    setNewLinkTitle("");
    setNewLinkUrl("");
  };

  const handleDeleteLink = (linkId) => {
    onUpdate({
      ...project,
      links: project.links.filter((l) => l.id !== linkId),
    });
  };

  const handleNoteKeyDown = (e) => {
    if (e.key === "Enter") handleAddNote();
  };

  return (
    <div className="project-content">
      <section className="content-section">
        <h4 className="content-section-title">Notas</h4>
        <div className="content-list">
          {project.notas?.map((note) => (
            <div key={note.id} className="content-item">
              <span className="content-item-text">{note.text}</span>
              <button
                className="content-item-delete"
                onClick={() => handleDeleteNote(note.id)}
                title="Eliminar nota"
              >
                ✕
              </button>
            </div>
          ))}
          {(!project.notas || project.notas.length === 0) && (
            <p className="content-empty">Aún no hay notas</p>
          )}
        </div>
        <div className="content-input-row">
          <input
            className="content-input"
            type="text"
            placeholder="Escribe una nota..."
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            onKeyDown={handleNoteKeyDown}
          />
          <button className="content-add-btn" onClick={handleAddNote} disabled={!newNote.trim()}>
            +
          </button>
        </div>
      </section>

      <section className="content-section">
        <h4 className="content-section-title">Links</h4>
        <div className="content-list">
          {project.links?.map((link) => (
            <div key={link.id} className="content-item">
              <a
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="content-item-link"
              >
                {link.title}
              </a>
              <button
                className="content-item-delete"
                onClick={() => handleDeleteLink(link.id)}
                title="Eliminar link"
              >
                ✕
              </button>
            </div>
          ))}
          {(!project.links || project.links.length === 0) && (
            <p className="content-empty">Aún no hay links</p>
          )}
        </div>
        <div className="content-input-row">
          <input
            className="content-input"
            type="text"
            placeholder="Título del link..."
            value={newLinkTitle}
            onChange={(e) => setNewLinkTitle(e.target.value)}
          />
          <input
            className="content-input"
            type="url"
            placeholder="https://..."
            value={newLinkUrl}
            onChange={(e) => setNewLinkUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleAddLink();
            }}
          />
          <button className="content-add-btn" onClick={handleAddLink} disabled={!newLinkTitle.trim() || !newLinkUrl.trim()}>
            +
          </button>
        </div>
      </section>
    </div>
  );
}
