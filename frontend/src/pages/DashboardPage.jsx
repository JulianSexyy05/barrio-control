// Página de inicio del dashboard donde se muestra el listado de proyectos y el boton para crear nuevos proyectos, al hacer click en el boton se abre un modal para ingresar el nombre del nuevo proyecto, y luego se agrega a la lista de proyectos.
// ahi impotamos el boton que creamos en el componente y lo usamos en la pagina del dashboard

import { useState, useEffect } from "react";
import Button from "../components/Button";
import ProjectModal from "../components/ProjectModal";
import "../styles/dashboard.css";


export default function DashboardPage() {
  const [projects, setProjects] = useState(() => {
    const saved = localStorage.getItem("kamilo-projects");
    return saved ? JSON.parse(saved) : ["Barco Autónomo", "Ideas"];
  }); // este estado se encarga de almacenar la lista de proyectos, se inicializa con una funcion que intenta cargar los proyectos guardados en el localStorage, si no hay proyectos guardados se inicializa con una lista de ejemplo con dos proyectos predefinidos. Esto permite que los proyectos creados por el usuario se mantengan incluso después de cerrar o recargar la pagina, mejorando la experiencia del usuario al no perder su trabajo.


  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem("kamilo-projects", JSON.stringify(projects));
  }, [projects]); // este efecto se ejecuta cada vez que el estado de proyectos cambia, guarda la lista actualizada de proyectos en el localStorage para que se mantenga persistente entre sesiones. Esto asegura que los proyectos creados por el usuario no se pierdan al cerrar o recargar la pagina, mejorando la experiencia del usuario al mantener su trabajo guardado.



  const handleCreateProject = (name) => {
    if (name.trim()) {
      setProjects([...projects, name.trim()]);
    }
    setModalOpen(false);
  }; // esta funcion se encarga de crear un nuevo proyecto, recibe el nombre del proyecto como parametro, verifica que no este vacio o solo con espacios, si es valido agrega el nuevo proyecto a la lista de proyectos usando el estado, y luego cierra el modal. Esto permite al usuario agregar nuevos proyectos a su dashboard de manera sencilla y rapida, mejorando la experiencia del usuario al facilitar la gestion de sus proyectos.

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="header-text">
          <h1 className="dashboard-title">Kamilo Atlas</h1>
          <p className="dashboard-subtitle">Tu centro de conocimiento personal inteligente.</p>
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
        /> // si el estado modalOpen es true, se renderiza el componente ProjectModal, se le pasan dos props: onConfirm que es la funcion handleCreateProject para manejar la creacion de un nuevo proyecto, y onCancel que es una funcion que simplemente cierra el modal al establecer modalOpen en false. Esto permite mostrar el modal de creacion de proyecto cuando el usuario hace click en el boton, y manejar la creacion o cancelacion del nuevo proyecto de manera eficiente, mejorando la experiencia del usuario al facilitar la gestion de sus proyectos.
      )}
    </div>
  );
} 


