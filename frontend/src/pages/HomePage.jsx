import { Link } from "react-router-dom";
import "../styles/home.css";

const highlights = [
  "Organiza proyectos y notas en un solo lugar",
  "Accede rapido a tu centro de conocimiento",
  "Convierte ideas sueltas en avances visibles",
];

export default function HomePage() {
  return (
    <main className="home-page">
      <nav className="home-nav" aria-label="Principal">
        <Link className="home-brand" to="/">
          Kamilo Atlas
        </Link>
        <div className="home-nav-actions">
          <Link className="home-link" to="/login">
            Iniciar sesion
          </Link>
          <Link className="home-nav-btn" to="/register">
            Crear cuenta
          </Link>
        </div>
      </nav>

      <section className="home-hero">
        <div className="home-copy">
          <p className="home-kicker">Tu espacio personal de proyectos</p>
          <h1>Construye, guarda y retoma tus ideas con mas claridad.</h1>
          <p className="home-description">
            Kamilo Atlas te ayuda a centralizar proyectos, contenidos y avances para que no empieces cada dia desde cero.
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

        <div className="home-panel" aria-label="Vista previa de Kamilo Atlas">
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
        {highlights.map((item) => (
          <article className="highlight-card" key={item}>
            <span className="highlight-dot" />
            <p>{item}</p>
          </article>
        ))}
      </section>
    </main>
  );
}
