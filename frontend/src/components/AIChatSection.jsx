import { useState, useRef, useEffect } from "react";
import { askProjectAi } from "../services/aiChat";

export default function AIChatSection({ project }) {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const chatRef = useRef(null);

  const STORAGE_KEY = `chat-${project.id}`;

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try { setMessages(JSON.parse(saved)); } catch { setMessages([]); }
    }
  }, [STORAGE_KEY]);

  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    }
  }, [messages, STORAGE_KEY]);

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages]);

  const handleAsk = async () => {
    const q = question.trim();
    if (!q || loading) return;
    setLoading(true);
    setError("");
    try {
      const data = await askProjectAi(project.id, q, project, messages);
      setMessages((prev) => [...prev, { role: "user", content: q }, { role: "assistant", content: data.answer }]);
      setQuestion("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setMessages([]);
    localStorage.removeItem(STORAGE_KEY);
    setError("");
  };

  return (
    <section className="ai-chat-preview">
      <div className="ai-chat-window" ref={chatRef}>
        {messages.length === 0 && <p className="ai-chat-empty">Haz una pregunta sobre tu proyecto...</p>}
        {messages.map((msg, i) => (
          <div key={i} className={`ai-message ai-message-${msg.role}`}>{msg.content}</div>
        ))}
      </div>
      {error && <p className="ai-chat-error">{error}</p>}
      {messages.length > 0 && <button className="ai-chat-clear" onClick={handleClear}>Limpiar conversación</button>}
      <div className="ai-chat-input-row">
        <textarea
          className="ai-chat-input" placeholder="Pregunta sobre este proyecto..." rows="2"
          value={question} onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleAsk(); } }}
        />
        <button className="ai-chat-send" type="button" onClick={handleAsk} disabled={!question.trim() || loading}>
          {loading ? "Preguntando..." : "Preguntar"}
        </button>
      </div>
    </section>
  );
}
