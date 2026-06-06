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
    saveProjects(projects); // Guardar proyectos en localStorage cada vez que cambie el estado de proyectos para persistir los datos entre sesiones
  }, [projects]);

  const handleCreateProject = (name) => {
    if (name.trim()) {
      setProjects([...projects, createProject(name)]); // Crear un nuevo proyecto usando la función createProject y agregarlo al estado de proyectos
    }
    setModalOpen(false);
  };

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id); // estas dos lineas se encargan de expandir o colapsar el contenido del proyecto al hacer clic en su encabezado. Si el proyecto ya está expandido (expandedId === id), se colapsa estableciendo expandedId a null. Si no está expandido, se establece expandedId al id del proyecto para mostrar su contenido.
  };

  const handleDeleteProject = (projectId) => {
    const project = projects.find((p) => p.id === projectId);
    if (!project) return; /// Si no se encuentra el proyecto, no hacer nada

    const confirmed = window.confirm(`¿Eliminar "${project.name}" y todo su contenido?`);
    if (!confirmed) return;

    setProjects(projects.filter((p) => p.id !== projectId));
    if (expandedId === projectId) setExpandedId(null);  // Si el proyecto eliminado estaba expandido, colapsar su contenido estableciendo expandedId a null
  };

  const handleUpdateProject = (updatedProject) => {
    setProjects(projects.map((p) => (p.id === updatedProject.id ? updatedProject : p))); // Actualizar el proyecto en el estado de proyectos reemplazando el proyecto con el mismo id por el proyecto actualizado
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

        {projects.length === 0 ? (
          <div className="projects-empty">
            <p className="projects-empty-title">Aún no tienes proyectos</p>
            <p className="projects-empty-text">Crea tu primer espacio para guardar notas, links y archivos.</p>
            <Button text="+ Crear Proyecto" onClick={() => setModalOpen(true)} />
          </div>
        ) : (
          <div className="projects-list">
            {projects.map((project, index) => (
              <div key={project.id} className={`project-card ${expandedId === project.id ? "expanded" : ""}`}>

                <div className="project-card-header" onClick={() => toggleExpand(project.id)}>
                  <div className="project-card-left">
                    <span className="project-index">#{String(index + 1).padStart(2, "0")}</span>
                    <p className="project-name">{project.name}</p>
                  </div> 
                  <div className="project-card-actions">
                    <button
                      className="project-delete-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteProject(project.id);
                      }}
                      title="Eliminar proyecto"
                    >
                      Eliminar
                    </button>
                    <span className={`expand-icon ${expandedId === project.id ? "open" : ""}`}>
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </span>
                  </div>
                </div>

                {expandedId === project.id && (
                  <div className="project-card-body">
                    <ProjectContent project={project} onUpdate={handleUpdateProject} />
                  </div>
                )}

              </div>
            ))}
          </div>
        )}
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
