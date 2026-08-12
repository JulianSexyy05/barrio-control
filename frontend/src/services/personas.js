import api from "./api";

export async function listarPersonas(params = {}) {
  const res = await api.get("/personas", { params });
  return res.data;
}

export async function obtenerPersona(id) {
  const res = await api.get(`/personas/${id}`);
  return res.data;
}

export async function crearPersona(data) {
  const res = await api.post("/personas", data);
  return res.data;
}

export async function actualizarPersona(id, data) {
  const res = await api.put(`/personas/${id}`, data);
  return res.data;
}

export async function eliminarPersona(id) {
  const res = await api.delete(`/personas/${id}`);
  return res.data;
}
