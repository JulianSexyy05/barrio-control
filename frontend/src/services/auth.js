import api from "./api";

export async function login({ correo, password }) {
  const res = await api.post("/auth/login", { correo, password });
  localStorage.setItem("token", res.data.token);
  localStorage.setItem("usuario", JSON.stringify(res.data.usuario));
  return res.data;
}

export async function register({ nombre, correo, password }) {
  const res = await api.post("/auth/register", { nombre, correo, password });
  localStorage.setItem("token", res.data.token);
  localStorage.setItem("usuario", JSON.stringify(res.data.usuario));
  return res.data;
}

export async function getMe() {
  const res = await api.get("/auth/me");
  return res.data;
}

export function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("usuario");
}

export function getStoredUser() {
  const stored = localStorage.getItem("usuario");
  return stored ? JSON.parse(stored) : null;
}

export function getToken() {
  return localStorage.getItem("token");
}
