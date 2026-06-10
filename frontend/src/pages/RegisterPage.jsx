import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { registerUser, loginWithGoogle } from "../services/auth";
import "../styles/auth.css";

export default function RegisterPage() {
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const getPasswordStrength = (password) => {
    if (password.length === 0) return null;
    if (password.length < 6) return { label: "Muy débil", color: "#ff6b6b", width: "25%" };
    if (password.length < 8) return { label: "Débil", color: "#ffa94d", width: "50%" };
    if (!/[A-Z]/.test(password) || !/[0-9]/.test(password)) return { label: "Regular", color: "#ffd43b", width: "75%" };
    return { label: "Fuerte", color: "#c8f060", width: "100%" };
  };

  const strength = getPasswordStrength(form.password);

  const handleSubmit = async () => {
    const newErrors = {};

    if (!form.name.trim()) newErrors.name = "El nombre es requerido.";
    if (!form.email) newErrors.email = "El correo es requerido.";
    else if (!validateEmail(form.email)) newErrors.email = "El correo no tiene un formato válido.";
    if (!form.password) newErrors.password = "La contraseña es requerida.";
    else if (form.password.length < 6) newErrors.password = "Mínimo 6 caracteres.";
    if (form.password !== form.confirm) newErrors.confirm = "Las contraseñas no coinciden.";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      await registerUser({ name: form.name, email: form.email, password: form.password });
      navigate("/dashboard");
    } catch (err) {
      const msg = err.code === "auth/email-already-in-use"
        ? "Este correo ya está registrado."
        : "Error al crear la cuenta. Intenta de nuevo.";
      setErrors({ email: msg });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setLoading(true);
    try {
      await loginWithGoogle();
      navigate("/dashboard");
    } catch {
      setErrors({ email: "No se pudo iniciar sesión con Google." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-box">
        <div className="auth-header">
          <h1 className="auth-logo">Kamilo Atlas</h1>
          <p className="auth-subtitle">Crea tu cuenta personal</p>
        </div>

        <div className="auth-fields">
          <div className="field-group">
            <label className="field-label">Nombre completo</label>
            <input
              className={`field-input ${errors.name ? "input-error" : ""}`}
              type="text" name="name" placeholder="Julian Noguera"
              value={form.name} onChange={handleChange}
            />
            {errors.name && <p className="field-error">{errors.name}</p>}
          </div>

          <div className="field-group">
            <label className="field-label">Correo electrónico</label>
            <input
              className={`field-input ${errors.email ? "input-error" : ""}`}
              type="email" name="email" placeholder="tu@correo.com"
              value={form.email} onChange={handleChange}
            />
            {errors.email && <p className="field-error">{errors.email}</p>}
          </div>

          <div className="field-group">
            <label className="field-label">Contraseña</label>
            <div className="input-wrapper">
              <input
                className={`field-input ${errors.password ? "input-error" : ""}`}
                type={showPassword ? "text" : "password"} name="password"
                placeholder="••••••••" value={form.password} onChange={handleChange}
              />
              <button className="eye-btn" onClick={() => setShowPassword(!showPassword)} tabIndex={-1}>
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 4.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
            {strength && (
              <div className="strength-bar-wrapper">
                <div className="strength-bar" style={{ width: strength.width, background: strength.color }} />
                <span className="strength-label" style={{ color: strength.color }}>{strength.label}</span>
              </div>
            )}
            {errors.password && <p className="field-error">{errors.password}</p>}
          </div>

          <div className="field-group">
            <label className="field-label">Confirmar contraseña</label>
            <div className="input-wrapper">
              <input
                className={`field-input ${errors.confirm ? "input-error" : ""}`}
                type={showConfirm ? "text" : "password"} name="confirm"
                placeholder="••••••••" value={form.confirm} onChange={handleChange}
              />
              <button className="eye-btn" onClick={() => setShowConfirm(!showConfirm)} tabIndex={-1}>
                {showConfirm ? (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 4.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
            {errors.confirm && <p className="field-error">{errors.confirm}</p>}
          </div>

          <button className="auth-btn" onClick={handleSubmit} disabled={loading}>
            {loading ? "Creando cuenta..." : "Crear cuenta"}
          </button>

          <div className="auth-divider"><span>O regístrate con</span></div>

          <button className="auth-google-btn" onClick={handleGoogle} disabled={loading}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="20" height="20">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
              <path fill="#FBBC05" d="M10.53 28.59A14.5 14.5 0 019.5 24c0-1.59.28-3.14.76-4.59l-7.98-6.19A23.99 23.99 0 000 24c0 3.77.87 7.35 2.56 10.78l7.97-6.19z"/>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
            </svg>
            Continuar con Google
          </button>
        </div>

        <p className="auth-link">
          ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
        </p>
      </div>
    </div>
  );
}