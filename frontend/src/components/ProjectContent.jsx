import { useState, useRef, useEffect } from "react";
import { askProjectAi } from "../services/aiChat";

export default function ProjectContent({ project, onUpdate }) {
  const [newNote, setNewNote] = useState("");
  const [newLinkTitle, setNewLinkTitle] = useState("");
  const [newLinkUrl, setNewLinkUrl] = useState("");
  const [aiQuestion, setAiQuestion] = useState("");
  const [messages, setMessages] = useState([]);
  const [aiError, setAiError] = useState("");
  const [isAskingAi, setIsAskingAi] = useState(false);
  const fileInputRef = useRef(null);
  const chatWindowRef = useRef(null);

  const CHAT_STORAGE_KEY = `chat-${project.id}`;

  const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2 MB

  useEffect(() => {
    const saved = localStorage.getItem(CHAT_STORAGE_KEY);
    if (saved) {
      try {
        setMessages(JSON.parse(saved));
      } catch {
        setMessages([]);
      }
    }
  }, [CHAT_STORAGE_KEY]);

  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(messages));
    }
  }, [messages, CHAT_STORAGE_KEY]);

  useEffect(() => {
    if (chatWindowRef.current) {
      chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
    }
  }, [messages]);

  const handleAddNote = () => {
    if (!newNote.trim()) return;
    onUpdate({
      ...project,
      notas: [...project.notas, { id: crypto.randomUUID(), text: newNote.trim() }],
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
        { id: crypto.randomUUID(), title: newLinkTitle.trim(), url: newLinkUrl.trim() },
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

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = [];

    for (const file of files) {
      if (file.size > MAX_FILE_SIZE) {
        alert(`"${file.name}" excede el límite de 2 MB. No se agregó.`);
        continue;
      }
      validFiles.push(file);
    }

    if (validFiles.length === 0) return;

    Promise.all(
      validFiles.map((file) => {
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = () =>
            resolve({
              id: crypto.randomUUID(),
              name: file.name,
              size: file.size,
              type: file.type,
              data: reader.result,
            });
          reader.readAsDataURL(file);
        });
      })
    ).then((newFiles) => {
      onUpdate({
        ...project,
        archivos: [...project.archivos, ...newFiles],
      });
    });

    e.target.value = "";
  };

  const handleDeleteFile = (fileId) => {
    onUpdate({
      ...project,
      archivos: project.archivos.filter((f) => f.id !== fileId),
    });
  };

  const formatSize = (bytes) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const handleNoteKeyDown = (e) => {
    if (e.key === "Enter") handleAddNote();
  };

  const handleAskAi = async () => {
    const question = aiQuestion.trim();
    if (!question || isAskingAi) return;

    setIsAskingAi(true);
    setAiError("");

    try {
      const data = await askProjectAi(project.id, question, project, messages);
      setMessages((prev) => [
        ...prev,
        { role: "user", content: question },
        { role: "assistant", content: data.answer },
      ]);
      setAiQuestion("");
    } catch (error) {
      setAiError(error.message);
    } finally {
      setIsAskingAi(false);
    }
  };

  const handleAiKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleAskAi();
    }
  };

  const handleClearChat = () => {
    setMessages([]);
    localStorage.removeItem(CHAT_STORAGE_KEY);
    setAiError("");
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

      <section className="content-section">
        <h4 className="content-section-title">Archivos</h4>
        <div className="content-list">
          {project.archivos?.map((file) => (
            <div key={file.id} className="content-item file-item">
              <div className="file-info">
                <span className="file-icon">📄</span>
                <div className="file-details">
                  <span className="file-name">{file.name}</span>
                  <span className="file-size">{formatSize(file.size)}</span>
                </div>
              </div>
              <div className="file-actions">
                <a
                  href={file.data}
                  download={file.name}
                  className="file-download"
                  title="Descargar"
                >
                  ⬇
                </a>
                <button
                  className="content-item-delete"
                  onClick={() => handleDeleteFile(file.id)}
                  title="Eliminar archivo"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
          {(!project.archivos || project.archivos.length === 0) && (
            <p className="content-empty">Aún no hay archivos</p>
          )}
        </div>
        <div className="content-input-row">
          <button className="content-file-btn" onClick={() => fileInputRef.current?.click()}>
            + Agregar archivos
          </button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleFileChange}
            style={{ display: "none" }}
          />
        </div>
      </section>

      <section className="ai-chat-preview">
        <div className="ai-chat-window" ref={chatWindowRef}>
          {messages.length === 0 && (
            <p className="ai-chat-empty">Haz una pregunta sobre tu proyecto...</p>
          )}
          {messages.map((msg, i) => (
            <div key={i} className={`ai-message ai-message-${msg.role}`}>
              {msg.content}
            </div>
          ))}
        </div>

        {aiError && <p className="ai-chat-error">{aiError}</p>}

        {messages.length > 0 && (
          <button className="ai-chat-clear" onClick={handleClearChat}>
            Limpiar conversación
          </button>
        )}

        <div className="ai-chat-input-row">
          <textarea
            className="ai-chat-input"
            placeholder="Pregunta sobre este proyecto..."
            rows="2"
            value={aiQuestion}
            onChange={(e) => setAiQuestion(e.target.value)}
            onKeyDown={handleAiKeyDown}
          />
          <button
            className="ai-chat-send"
            type="button"
            onClick={handleAskAi}
            disabled={!aiQuestion.trim() || isAskingAi}
          >
            {isAskingAi ? "Preguntando..." : "Preguntar"}
          </button>
        </div>
      </section>
    </div>
  );
}
