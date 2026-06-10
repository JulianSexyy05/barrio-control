const STORAGE_KEY = "kamilo-projects";

function normalizeProject(project, index) {
  return {
    id: project.id ?? Date.now() + index,
    name: project.name ?? "Proyecto sin nombre",
    notas: Array.isArray(project.notas) ? project.notas : [],
    links: Array.isArray(project.links) ? project.links : [],
    archivos: Array.isArray(project.archivos) ? project.archivos : [],
  }; // estas lineas se encargan de asegurar que cada proyecto tenga una estructura consistente, asignando valores predeterminados en caso de que falten propiedades o tengan formatos incorrectos. Esto ayuda a prevenir errores al manipular los proyectos en la aplicación.
}

export function getProjects() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return [];

    const projects = JSON.parse(saved);
    return Array.isArray(projects) ? projects.map(normalizeProject) : [];
  } catch {
    return [];
  }
}

export function saveProjects(projects) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
}

export function createProject(name) {
  return {
    id: crypto.randomUUID(),
    name: name.trim(),
    notas: [],
    links: [],
    archivos: [],
  };
}
