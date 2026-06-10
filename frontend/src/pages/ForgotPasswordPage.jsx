import { useState } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../services/firebase";
import { Link } from "react-router-dom";
import "../styles/auth.css";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!email.trim()) {
      setError("Ingresa tu correo.");
      return;
    }
    setError("");
    try {
      await sendPasswordResetEmail(auth, email);
      setSent(true);
    } catch (err) {
      if (err.code === "auth/user-not-found") {
        setError("No hay cuenta registrada con ese correo.");
      } else {
        setError("Error al enviar el correo. Intenta de nuevo.");
      }
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-box">
        <div className="auth-header">
          <h1 className="auth-logo">Kamilo Atlas</h1>
          <p className="auth-subtitle">Recupera tu contraseña</p>
        </div>

        {sent ? (
          <div className="auth-success">
            <span className="success-icon">✓</span>
            <p>Revisa tu bandeja de entrada</p>
            <p className="success-sub">Te enviamos un link a {email} para restablecer tu contraseña.</p>
            <Link to="/login" className="auth-btn" style={{ display: "inline-block", marginTop: "20px", textDecoration: "none" }}>
              Volver al inicio de sesión
            </Link>
          </div>
        ) : (
          <div className="auth-fields">
            <p style={{ color: "var(--muted)", fontSize: "0.85rem", marginBottom: "16px", lineHeight: "1.5" }}>
              Ingresa tu correo y te enviaremos un link para restablecer tu contraseña.
            </p>
            <div className="field-group">
              <label className="field-label">Correo electrónico</label>
              <input
                className="field-input"
                type="email" placeholder="tu@correo.com"
                value={email} onChange={(e) => { setEmail(e.target.value); setError(""); }}
                onKeyDown={(e) => { if (e.key === "Enter") handleSubmit(); }}
              />
            </div>
            {error && <p className="auth-error">⚠ {error}</p>}
            <button className="auth-btn" onClick={handleSubmit}>
              Enviar link
            </button>
            <p className="auth-link" style={{ marginTop: "16px" }}>
              <Link to="/login">Volver al inicio de sesión</Link>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
