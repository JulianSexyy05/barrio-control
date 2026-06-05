const STORAGE_KEY = "kamilo-projects";

const DEFAULT_PROJECTS = [
  { id: 1, name: "Barco Autónomo", notas: [], links: [], archivos: [] },
  { id: 2, name: "Ideas", notas: [], links: [], archivos: [] },
];

export function getProjects() {
  const saved = localStorage.getItem(STORAGE_KEY);
  return saved ? JSON.parse(saved) : [...DEFAULT_PROJECTS];
}

export function saveProjects(projects) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
}

export function createProject(name) {
  return {
    id: Date.now(),
    name: name.trim(),
    notas: [],
    links: [],
    archivos: [],
  };
}
