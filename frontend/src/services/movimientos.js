import api from "./api";

export async function listarMovimientos(params = {}) {
  const res = await api.get("/movimientos", { params });
  return res.data;
}

export async function crearMovimiento(data) {
  const res = await api.post("/movimientos", data);
  return res.data;
}

export async function actualizarMovimiento(id, data) {
  const res = await api.put(`/movimientos/${id}`, data);
  return res.data;
}

export async function eliminarMovimiento(id) {
  const res = await api.delete(`/movimientos/${id}`);
  return res.data;
}

export async function obtenerSaldo() {
  const res = await api.get("/movimientos/saldo");
  return res.data;
}

export async function obtenerResumen() {
  const res = await api.get("/movimientos/resumen");
  return res.data;
}
