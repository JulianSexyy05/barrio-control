import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../components/Button";
import ProjectModal from "../components/ProjectModal";
import ProjectContent from "../components/ProjectContent";
import { logoutUser } from "../services/auth";
import { getProjects, saveProjects, createProject } from "../services/projects";
import "../styles/dashboard.css";

export default function DashboardPage() { // El estado de proyectos se inicializa con los datos cargados desde localStorage usando getProjects()
  const [projects, setProjects] = useState(() => getProjects()); // Cargar proyectos desde localStorage al iniciar el componente
  const [modalOpen, setModalOpen] = useState(false); // Para controlar la visibilidad del modal de creación de proyectos
  const [expandedId, setExpandedId] = useState(null); // Para controlar qué proyecto está expandido en la lista
  const navigate = useNavigate(); // Para redirigir al login después de cerrar sesión

  useEffect(() => {
    saveProjects(projects);
  }, [projects]);

  const handleCreateProject = (name) => {
    if (name.trim()) {
      setProjects([...projects, createProject(name)]); // Crear un nuevo proyecto usando la función createProject y agregarlo al estado de proyectos
    }
    setModalOpen(false);
  };

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handleUpdateProject = (updatedProject) => {
    setProjects(projects.map((p) => (p.id === updatedProject.id ? updatedProject : p)));
  };

  const handleLogout = () => {
    logoutUser(); // Elimina el token de autenticación y cualquier otro dato relacionado con la sesión
    navigate("/login"); //Redirige al usuario a la página de login después de cerrar sesión
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="header-text">
          <h1 className="dashboard-title">Kamilo Atlas</h1>
          <p className="dashboard-subtitle">Tu centro de conocimiento personal inteligente.</p>
        </div>
        <div className="header-actions">
          <Button text="+ Crear Proyecto" onClick={() => setModalOpen(true)} />
          <button className="logout-btn" onClick={handleLogout}>Cerrar sesión</button>
        </div>
      </header>

      <section className="projects-section">
        <h2 className="section-title">Proyectos recientes</h2>

        <div className="projects-list">
          {projects.map((project, index) => (
            <div key={project.id} className={`project-card ${expandedId === project.id ? "expanded" : ""}`}>  

              <div className="project-card-header" onClick={() => toggleExpand(project.id)}>
                <div className="project-card-left">
                  <span className="project-index">#{String(index + 1).padStart(2, "0")}</span>
                  <p className="project-name">{project.name}</p>
                </div>
                <span className={`expand-icon ${expandedId === project.id ? "open" : ""}`}>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </span>
              </div>

              {expandedId === project.id && (
                <div className="project-card-body">
                  <ProjectContent project={project} onUpdate={handleUpdateProject} />
                </div>
              )}
              
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