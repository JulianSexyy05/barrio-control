import api from "./api";

export async function listarUsuarios() {
  const res = await api.get("/usuarios");
  return res.data;
}

export async function crearUsuario(data) {
  const res = await api.post("/usuarios", data);
  return res.data;
}

export async function cambiarRolUsuario(id, rol) {
  const res = await api.put(`/usuarios/${id}/rol`, { rol });
  return res.data;
}

export async function eliminarUsuario(id) {
  const res = await api.delete(`/usuarios/${id}`);
  return res.data;
}
