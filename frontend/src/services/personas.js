import api from "./api";

export async function listarPersonas(params = {}) {
  const res = await api.get("/personas", { params });
  return res.data;
}

export async function crearPersona(data) {
  const res = await api.post("/personas", data);
  return res.data;
}
