import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { registerUser } from "../services/auth";
import "../styles/auth.css";

export default function RegisterPage() {
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [success, setSuccess] = useState(false);
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

    await registerUser({ name: form.name, email: form.email, password: form.password });
    setSuccess(true);
    setTimeout(() => navigate("/dashboard"), 1500);
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-box">
        <div className="auth-header">
          <h1 className="auth-logo">Kamilo Atlas</h1>
          <p className="auth-subtitle">Crea tu cuenta personal</p>
        </div>

        {success ? (
          <div className="auth-success">
            <span className="success-icon">✓</span>
            <p>¡Cuenta creada exitosamente!</p>
            <p className="success-sub">Bienvenido a Kamilo Atlas...</p>
          </div>
        ) : (
          <div className="auth-fields">
            <div className="field-group">
              <label className="field-label">Nombre completo</label>
              <input
                className={`field-input ${errors.name ? "input-error" : ""}`}
                type="text"
                name="name"
                placeholder="Julian Noguera"
                value={form.name}
                onChange={handleChange}
              />
              {errors.name && <p className="field-error">{errors.name}</p>}
            </div>

            <div className="field-group">
              <label className="field-label">Correo electrónico</label>
              <input
                className={`field-input ${errors.email ? "input-error" : ""}`}
                type="email"
                name="email"
                placeholder="tu@correo.com"
                value={form.email}
                onChange={handleChange}
              />
              {errors.email && <p className="field-error">{errors.email}</p>}
            </div>

            <div className="field-group">
              <label className="field-label">Contraseña</label>
              <div className="input-wrapper">
                <input
                  className={`field-input ${errors.password ? "input-error" : ""}`}
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={handleChange}
                />
                <button
                  className="eye-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
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
                  type={showConfirm ? "text" : "password"}
                  name="confirm"
                  placeholder="••••••••" // El campo de confirmación de contraseña tiene el mismo formato que el campo de contraseña principal, pero su función es permitir al usuario ingresar nuevamente su contraseña para verificar que la ha escrito correctamente antes de crear la cuenta.
                  value={form.confirm} // El valor del campo de confirmación de contraseña se vincula al estado del formulario para que pueda ser validado en tiempo real y comparado con el campo de contraseña principal para asegurar que ambos coincidan antes de permitir la creación de la cuenta.
                  onChange={handleChange} // Utiliza la misma función handleChange para actualizar el estado del formulario con el valor de confirmación de contraseña, lo que permite validar que ambas contraseñas coincidan antes de permitir la creación de la cuenta.
                />
                <button
                  className="eye-btn"
                  onClick={() => setShowConfirm(!showConfirm)} // Permite alternar la visibilidad de la confirmación de contraseña para que el usuario pueda verificar que ha ingresado la misma contraseña en ambos campos.
                  tabIndex={-1} // Evita que el botón de mostrar/ocultar contraseña sea enfocado al navegar con el teclado, ya que su función es meramente visual y no interactiva en términos de formulario.
                >
                  {showConfirm ? (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"> // Icono de ojo abierto para mostrar la confirmación de contraseña
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 4.411m0 0L21 21" /> // Icono de ojo abierto para mostrar la confirmación de contraseña
                    </svg> // Icono de ojo abierto para mostrar la contraseña
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

            <button className="auth-btn" onClick={handleSubmit}>
              Crear cuenta
            </button>
          </div>
        )}

        {!success && (
          <p className="auth-link">
            ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
          </p>
        )}
      </div>
    </div>
  );
}