import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../components/Button";
import ProjectModal from "../components/ProjectModal";
import ProjectContent from "../components/ProjectContent";
import { logoutUser, onAuthChange } from "../services/auth";
import { getProjects, createProject, updateProject, deleteProject } from "../services/projects";
import "../styles/dashboard.css";

export default function DashboardPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthChange((user) => {
      if (!user) {
        navigate("/login");
        return;
      }
      loadProjects();
    });
    return unsubscribe;
  }, []);

  async function loadProjects() {
    try {
      setLoading(true);
      setError(null);
      const data = await getProjects();
      setProjects(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const handleCreateProject = async (name) => {
    if (!name.trim()) return;
    try {
      const project = await createProject(name);
      setProjects([project, ...projects]);
      setModalOpen(false);
    } catch (err) {
      setError(err.message);
    }
  };

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handleDeleteProject = async (projectId) => {
    const project = projects.find((p) => p.id === projectId);
    if (!project) return;

    const confirmed = window.confirm(`¿Eliminar "${project.name}" y todo su contenido?`);
    if (!confirmed) return;

    try {
      await deleteProject(projectId);
      setProjects(projects.filter((p) => p.id !== projectId));
      if (expandedId === projectId) setExpandedId(null);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleUpdateProject = async (updatedProject) => {
    try {
      const result = await updateProject(updatedProject);
      setProjects(projects.map((p) => (p.id === result.id ? result : p)));
    } catch (err) {
      setError(err.message);
    }
  };

  const handleLogout = async () => {
    await logoutUser();
    navigate("/login");
  };

  if (loading) return <div className="dashboard"><p>Cargando proyectos...</p></div>;

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

      {error && <div className="error-banner">{error}</div>}

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
