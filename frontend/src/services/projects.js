import { auth } from "./firebase";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3001/api";

async function getAuthToken() {
  if (!auth.currentUser) throw new Error("Usuario no autenticado");
  return auth.currentUser.getIdToken();
}

async function apiFetch(path, options = {}) {
  const token = await getAuthToken();
  const res = await fetch(`${API_BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
    ...options,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message || `Error ${res.status}`);
  }

  return res.json();
}

export async function getProjects() {
  return apiFetch("/projects");
}

export async function createProject(name) {
  const project = {
    id: crypto.randomUUID(),
    name: name.trim(),
    notas: [],
    links: [],
    archivos: [],
  };
  return apiFetch("/projects", {
    method: "POST",
    body: JSON.stringify(project),
  });
}

export async function updateProject(project) {
  return apiFetch(`/projects/${project.id}`, {
    method: "PUT",
    body: JSON.stringify(project),
  });
}

export async function deleteProject(projectId) {
  return apiFetch(`/projects/${projectId}`, {
    method: "DELETE",
  });
}
