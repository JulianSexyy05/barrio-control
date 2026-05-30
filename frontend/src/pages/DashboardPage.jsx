// Página de inicio del dashboard donde se muestra el listado de proyectos y el boton para crear nuevos proyectos, al hacer click en el boton se abre un modal para ingresar el nombre del nuevo proyecto, y luego se agrega a la lista de proyectos.
// ahi impotamos el boton que creamos en el componente y lo usamos en la pagina del dashboard

import { useState } from "react";
import Button from "../components/Button";
import ProjectModal from "../components/ProjectModal";
import "../styles/dashboard.css";

export default function DashboardPage() {
  const [projects, setProjects] = useState(["Barco Autónomo", "Ideas"]);
  const [modalOpen, setModalOpen] = useState(false);

  const handleCreateProject = (name) => {
    if (name.trim()) {
      setProjects([...projects, name.trim()]);
    }
    setModalOpen(false);
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="header-text">
          <h1 className="dashboard-title">Kamilo Atlas</h1>
          <p className="dashboard-subtitle">conocimiento personal inteligente.</p>
        </div>
        <Button text="+ Crear Proyecto" onClick={() => setModalOpen(true)} />
      </header>

      <section className="projects-section">
        <h2 className="section-title">Proyectos recientes</h2>
        <div className="projects-grid">
          {projects.map((project, index) => (
            <div key={index} className="project-card">
              <span className="project-index">#{String(index + 1).padStart(2, "0")}</span>
              <p className="project-name">{project}</p>
            </div>
          ))}
        </div>
        
      </section>

      {modalOpen && (
        <ProjectModal
          onConfirm={handleCreateProject}
          onCancel={() => setModalOpen(false)}
        />
      )}
    </div>
  );
}   