import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "../styles/home.css";

const highlights = [
  {
    title: "Organiza",
    desc: "Tus proyectos, notas y archivos en un solo lugar, sin perder detalle.",
  },
  {
    title: "Accede",
    desc: "A tu conocimiento desde cualquier dispositivo al instante.",
  },
  {
    title: "Crece",
    desc: "Convierte ideas sueltas en avances visibles día a día.",
  },
];

const words = ["claridad.", "orden.", "progreso.", "enfoque."];

export default function HomePage() {
  const [wordIndex, setWordIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const current = words[wordIndex];
    const timeout = setTimeout(
      () => {
        if (!deleting) {
          if (charIndex < current.length) {
            setCharIndex(charIndex + 1);
          } else {
            setTimeout(() => setDeleting(true), 1800);
          }
        } else {
          if (charIndex > 0) {
            setCharIndex(charIndex - 1);
          } else {
            setDeleting(false);
            setWordIndex((wordIndex + 1) % words.length);
          }
        }
      },
      deleting ? 40 : 80
    );
    return () => clearTimeout(timeout);
  }, [charIndex, deleting, wordIndex]);

  return (
    <main className="home-page">
      <nav className="home-nav" aria-label="Principal">
        <Link className="home-brand" to="/">
          Kamilo Atlas
        </Link>
        <div className="home-nav-actions">
          <Link className="home-link" to="/login">
            Iniciar sesión
          </Link>
          <Link className="home-nav-btn" to="/register">
            Crear cuenta
          </Link>
        </div>
      </nav>

      <section className="home-hero">
        <div className="home-copy">
          <p className="home-kicker">Tu espacio personal de proyectos</p>
          <h1>
            Construye, guarda y retoma tus ideas con más{" "}
            <span className="typewriter">
              {words[wordIndex].slice(0, charIndex)}
              <span className="typewriter-cursor">|</span>
            </span>
          </h1>
          <p className="home-description">
            Kamilo Atlas te ayuda a centralizar proyectos, contenidos y avances
            para que no empieces cada día desde cero.
          </p>
          <div className="home-actions">
            <Link className="home-primary" to="/register">
              Empezar gratis
            </Link>
            <Link className="home-secondary" to="/login">
              Ya tengo cuenta
            </Link>
          </div>
        </div>

        <div className="home-panel" aria-label="Vista previa">
          <div className="panel-header">
            <span />
            <span />
            <span />
          </div>
          <div className="panel-card panel-card-main">
            <p className="panel-label">Proyecto activo</p>
            <h2>Atlas de conocimiento</h2>
            <div className="panel-progress">
              <span />
            </div>
          </div>
          <div className="panel-grid">
            <div className="panel-card">
              <p>Notas</p>
              <strong>24</strong>
            </div>
            <div className="panel-card">
              <p>Avances</p>
              <strong>8</strong>
            </div>
          </div>
        </div>
      </section>

      <section className="home-highlights" aria-label="Beneficios">
        {highlights.map((item, i) => (
          <article
            className="highlight-card"
            key={item.title}
            style={{ animationDelay: `${i * 0.15}s` }}
          >
            <span className="highlight-icon">{["📁", "⚡", "📈"][i]}</span>
            <div>
              <strong className="highlight-title">{item.title}</strong>
              <p>{item.desc}</p>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
