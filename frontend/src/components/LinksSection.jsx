import { useState } from "react";

export default function LinksSection({ links, onUpdate }) {
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");

  const handleAdd = () => {
    if (!title.trim() || !url.trim()) return;
    onUpdate([...links, { id: crypto.randomUUID(), title: title.trim(), url: url.trim() }]);
    setTitle("");
    setUrl("");
  };

  const handleDelete = (id) => {
    onUpdate(links.filter((l) => l.id !== id));
  };

  return (
    <section className="content-section">
      <h4 className="content-section-title">Links</h4>
      <div className="content-list">
        {links?.map((link) => (
          <div key={link.id} className="content-item">
            <a href={link.url} target="_blank" rel="noopener noreferrer" className="content-item-link">{link.title}</a>
            <button className="content-item-delete" onClick={() => handleDelete(link.id)} title="Eliminar link">✕</button>
          </div>
        ))}
        {(!links || links.length === 0) && <p className="content-empty">Aún no hay links</p>}
      </div>
      <div className="content-input-row">
        <input className="content-input" type="text" placeholder="Título del link..." value={title} onChange={(e) => setTitle(e.target.value)} />
        <input className="content-input" type="url" placeholder="https://..." value={url} onChange={(e) => setUrl(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") handleAdd(); }} />
        <button className="content-add-btn" onClick={handleAdd} disabled={!title.trim() || !url.trim()}>+</button>
      </div>
    </section>
  );
}
