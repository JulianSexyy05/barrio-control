import { useState, useEffect, useRef } from "react";
import "../styles/modal.css";

export default function ProjectModal({ onConfirm, onCancel }) {
  const [value, setValue] = useState("");
  const inputRef = useRef(null); // creamos una referencia para el input del modal, esto nos permite enfocar el input automaticamente al abrir el modal y tambien acceder a su valor de manera directa si es necesario.

  useEffect(() => {
    inputRef.current?.focus();
  }, []); // este efecto se ejecuta una sola vez al montar el componente, enfoca el input del modal para que el usuario pueda empezar a escribir inmediatamente sin tener que hacer click en el input.

  const handleKeyDown = (e) => {
    if (e.key === "Enter") onConfirm(value);
    if (e.key === "Escape") onCancel();
  }; // esta funcion maneja los eventos de teclado mientras el modal esta abierto, si el usuario presiona la tecla Enter se llama a la funcion onConfirm con el valor actual del input para crear un nuevo proyecto, si el usuario presiona la tecla Escape se llama a la funcion onCancel para cerrar el modal sin hacer cambios. Esto mejora la experiencia del usuario al permitirle usar el teclado para interactuar con el modal de manera mas eficiente.

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

// Este componente es el modal que se muestra al hacer click en el boton de crear proyecto, aqui se ingresa el nombre del nuevo proyecto y se confirma para agregarlo a la lista de proyectos, o se cancela para cerrar el modal sin hacer cambios. El modal se cierra al hacer click fuera de la caja del modal o al presionar la tecla Escape. El input se enfoca automáticamente al abrir el modal para facilitar la entrada de texto.