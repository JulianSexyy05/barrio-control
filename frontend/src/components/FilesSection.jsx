import { useRef, useState } from "react";

export default function FilesSection({ files, onUpdate }) {
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const MAX_SIZE = 2 * 1024 * 1024;

  const handleChange = (e) => {
    const fileList = Array.from(e.target.files);
    const valid = [];

    for (const file of fileList) {
      if (file.size > MAX_SIZE) {
        alert(`"${file.name}" excede el límite de 2 MB. No se agregó.`);
        continue;
      }
      valid.push(file);
    }

    if (valid.length === 0) return;

    setUploading(true);

    Promise.all(
      valid.map((file) => new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve({ id: crypto.randomUUID(), name: file.name, size: file.size, type: file.type, data: reader.result });
        reader.readAsDataURL(file);
      }))
    ).then((newFiles) => {
      onUpdate([...files, ...newFiles]);
      setUploading(false);
    });

    e.target.value = "";
  };

  const handleDelete = (id) => {
    onUpdate(files.filter((f) => f.id !== id));
  };

  const formatSize = (bytes) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  return (
    <section className="content-section">
      <h4 className="content-section-title">Archivos</h4>
      <div className="content-list">
        {files?.map((file) => (
          <div key={file.id} className="content-item file-item">
            <div className="file-info">
              <span className="file-icon">📄</span>
              <div className="file-details">
                <span className="file-name">{file.name}</span>
                <span className="file-size">{formatSize(file.size)}</span>
              </div>
            </div>
            <div className="file-actions">
              <a href={file.data} download={file.name} className="file-download" title="Descargar">⬇</a>
              <button className="content-item-delete" onClick={() => handleDelete(file.id)} title="Eliminar archivo">✕</button>
            </div>
          </div>
        ))}
        {(!files || files.length === 0) && <p className="content-empty">Aún no hay archivos</p>}
      </div>
      <div className="content-input-row">
        <button className="content-file-btn" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
          {uploading ? "Subiendo archivos..." : "+ Agregar archivos"}
        </button>
        <input ref={fileInputRef} type="file" multiple onChange={handleChange} style={{ display: "none" }} />
      </div>
    </section>
  );
}
