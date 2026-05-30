import { useState, useEffect, useRef } from "react";
import "../styles/modal.css";

export default function ProjectModal({ onConfirm, onCancel }) {
  const [value, setValue] = useState("");
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleKeyDown = (e) => {
    if (e.key === "Enter") onConfirm(value);
    if (e.key === "Escape") onCancel();
  };

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <h3 className="modal-title">Nuevo proyecto</h3>
        <p className="modal-hint">Dale un nombre a tu proyecto</p>
        <input
          ref={inputRef}
          className="modal-input"
          type="text"
          placeholder="Ej: Sistema de riego, Novela sci-fi..."
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          maxLength={60}
        />
        <div className="modal-actions">
          <button className="modal-btn cancel" onClick={onCancel}>Cancelar</button>
          <button
            className="modal-btn confirm"
            onClick={() => onConfirm(value)}
            disabled={!value.trim()}
          >
            Crear
          </button>
        </div>
      </div>
    </div>
  );
}