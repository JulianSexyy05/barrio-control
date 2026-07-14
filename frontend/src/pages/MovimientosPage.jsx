import { useState, useEffect, useCallback } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import { listarMovimientos, crearMovimiento, actualizarMovimiento, eliminarMovimiento } from "../services/movimientos";
import { listarPersonas, crearPersona } from "../services/personas";

function formatCurrency(value) {
  return new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(value || 0);
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString("es-CO", { day: "2-digit", month: "2-digit", year: "numeric" });
}

const emptyForm = {
  fecha: new Date().toISOString().split("T")[0],
  hora: "",
  tipo: "INGRESO",
  concepto: "",
  valor: "",
  observaciones: "",
  personaId: "",
};

const emptyNewPersona = { nombre: "", casa: "", telefono: "" };

export default function MovimientosPage() {
  const [movimientos, setMovimientos] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [filtros, setFiltros] = useState({ tipo: "", search: "", fechaDesde: "", fechaHasta: "" });
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [personas, setPersonas] = useState([]);
  const [error, setError] = useState("");
  const [showNewPersona, setShowNewPersona] = useState(false);
  const [newPersona, setNewPersona] = useState(emptyNewPersona);
  const [creatingPersona, setCreatingPersona] = useState(false);
  const limit = 20;

  const loadPersonas = useCallback(async () => {
    try {
      const data = await listarPersonas();
      setPersonas(data);
    } catch {}
  }, []);

  useEffect(() => { loadPersonas(); }, [loadPersonas]);

  const loadMovimientos = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit };
      if (filtros.tipo) params.tipo = filtros.tipo;
      if (filtros.search) params.search = filtros.search;
      if (filtros.fechaDesde) params.fechaDesde = filtros.fechaDesde;
      if (filtros.fechaHasta) params.fechaHasta = filtros.fechaHasta;
      const data = await listarMovimientos(params);
      setMovimientos(data.movimientos);
      setTotal(data.total);
    } catch (err) {
      console.error("Error loading movimientos:", err);
    } finally {
      setLoading(false);
    }
  }, [page, filtros]);

  useEffect(() => { loadMovimientos(); }, [loadMovimientos]);

  const handleAddPersona = async () => {
    if (!newPersona.nombre.trim()) return;
    setCreatingPersona(true);
    try {
      const created = await crearPersona({
        nombre: newPersona.nombre.trim(),
        casa: newPersona.casa.trim() || null,
        telefono: newPersona.telefono.trim() || null,
      });
      await loadPersonas();
      setForm({ ...form, personaId: created.id.toString() });
      setNewPersona(emptyNewPersona);
      setShowNewPersona(false);
    } catch (err) {
      setError(err.response?.data?.message || "Error al crear persona.");
    } finally {
      setCreatingPersona(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.concepto || !form.valor) {
      setError("Concepto y valor son obligatorios.");
      return;
    }

    try {
      const payload = {
        ...form,
        valor: parseFloat(form.valor),
        personaId: form.personaId ? parseInt(form.personaId) : null,
      };

      if (editingId) {
        await actualizarMovimiento(editingId, payload);
      } else {
        await crearMovimiento(payload);
      }

      setForm(emptyForm);
      setEditingId(null);
      setShowForm(false);
      loadMovimientos();
    } catch (err) {
      setError(err.response?.data?.message || "Error al guardar el movimiento.");
    }
  };

  const handleEdit = (mov) => {
    setForm({
      fecha: mov.fecha.split("T")[0],
      hora: mov.hora || "",
      tipo: mov.tipo,
      concepto: mov.concepto,
      valor: mov.valor.toString(),
      observaciones: mov.observaciones || "",
      personaId: mov.personaId?.toString() || "",
    });
    setEditingId(mov.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Eliminar este movimiento?")) return;
    try {
      await eliminarMovimiento(id);
      loadMovimientos();
    } catch (err) {
      alert(err.response?.data?.message || "Error al eliminar.");
    }
  };

  const totalPages = Math.ceil(total / limit);

  const personaField = (
    <div className={showNewPersona ? "sm:col-span-2 lg:col-span-3" : ""}>
      <label className="block text-xs font-medium text-gray-600 mb-1">Persona (opcional)</label>
      {!showNewPersona ? (
        <div className="flex gap-2">
          <select
            value={form.personaId}
            onChange={(e) => setForm({ ...form, personaId: e.target.value })}
            className="flex-1 px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          >
            <option value="">Sin persona</option>
            {personas.map((p) => (
              <option key={p.id} value={p.id}>{p.nombre}{p.casa ? ` - ${p.casa}` : ""}</option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => setShowNewPersona(true)}
            className="px-3 py-2 text-sm text-primary border border-primary/30 rounded-lg hover:bg-primary/5 transition-colors whitespace-nowrap"
          >
            + Nueva
          </button>
        </div>
      ) : (
        <div className="space-y-2 p-3 bg-gray-50 rounded-lg border border-border">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <input
              type="text"
              value={newPersona.nombre}
              onChange={(e) => setNewPersona({ ...newPersona, nombre: e.target.value })}
              className="px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              placeholder="Nombre *"
              autoFocus
            />
            <input
              type="text"
              value={newPersona.casa}
              onChange={(e) => setNewPersona({ ...newPersona, casa: e.target.value })}
              className="px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              placeholder="Casa / dirección"
            />
            <input
              type="text"
              value={newPersona.telefono}
              onChange={(e) => setNewPersona({ ...newPersona, telefono: e.target.value })}
              className="px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              placeholder="Teléfono"
            />
          </div>
          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={() => { setShowNewPersona(false); setNewPersona(emptyNewPersona); }}
              className="px-3 py-1.5 text-xs text-gray-600 hover:text-gray-900"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleAddPersona}
              disabled={creatingPersona || !newPersona.nombre.trim()}
              className="px-3 py-1.5 text-xs font-medium text-white bg-primary rounded-lg hover:bg-primary-dark disabled:opacity-50"
            >
              {creatingPersona ? "Guardando..." : "Guardar persona"}
            </button>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Movimientos</h1>
            <p className="text-sm text-gray-500 mt-1">{total} registros</p>
          </div>
          <button
            onClick={() => { setShowForm(!showForm); setEditingId(null); setForm(emptyForm); setShowNewPersona(false); }}
            className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-dark transition-colors"
          >
            {showForm ? "Cancelar" : "+ Nuevo movimiento"}
          </button>
        </div>

        {showForm && (
          <div className="bg-white rounded-xl border border-border shadow-sm p-5 mb-6">
            <h2 className="text-sm font-semibold text-gray-900 mb-4">
              {editingId ? "Editar movimiento" : "Nuevo movimiento"}
            </h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Fecha</label>
                <input type="date" value={form.fecha} onChange={(e) => setForm({ ...form, fecha: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Hora (opcional)</label>
                <input type="time" value={form.hora} onChange={(e) => setForm({ ...form, hora: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Tipo</label>
                <select value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary">
                  <option value="INGRESO">Ingreso</option>
                  <option value="EGRESO">Egreso</option>
                </select>
              </div>
              {personaField}
              <div className="sm:col-span-2 lg:col-span-1">
                <label className="block text-xs font-medium text-gray-600 mb-1">Valor</label>
                <input type="number" step="0.01" value={form.valor} onChange={(e) => setForm({ ...form, valor: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" placeholder="0" />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-gray-600 mb-1">Concepto</label>
                <input type="text" value={form.concepto} onChange={(e) => setForm({ ...form, concepto: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" placeholder="Descripción del movimiento" />
              </div>
              <div className="sm:col-span-2 lg:col-span-3">
                <label className="block text-xs font-medium text-gray-600 mb-1">Observaciones (opcional)</label>
                <textarea value={form.observaciones} onChange={(e) => setForm({ ...form, observaciones: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" rows={2} />
              </div>

              {error && <p className="text-sm text-danger bg-danger-light px-3 py-2 rounded-lg sm:col-span-2 lg:col-span-3">{error}</p>}

              <div className="sm:col-span-2 lg:col-span-3 flex justify-end gap-3">
                <button type="button" onClick={() => { setShowForm(false); setEditingId(null); setForm(emptyForm); setShowNewPersona(false); }}
                  className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors">
                  Cancelar
                </button>
                <button type="submit"
                  className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-dark transition-colors">
                  {editingId ? "Actualizar" : "Guardar"}
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="bg-white rounded-xl border border-border shadow-sm mb-4">
          <div className="p-4 border-b border-border flex flex-wrap gap-3">
            <select value={filtros.tipo} onChange={(e) => { setFiltros({ ...filtros, tipo: e.target.value }); setPage(1); }}
              className="px-3 py-1.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20">
              <option value="">Todos los tipos</option>
              <option value="INGRESO">Ingresos</option>
              <option value="EGRESO">Egresos</option>
            </select>
            <input type="text" value={filtros.search} onChange={(e) => { setFiltros({ ...filtros, search: e.target.value }); setPage(1); }}
              className="px-3 py-1.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" placeholder="Buscar..." />
            <input type="date" value={filtros.fechaDesde} onChange={(e) => { setFiltros({ ...filtros, fechaDesde: e.target.value }); setPage(1); }}
              className="px-3 py-1.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
            <input type="date" value={filtros.fechaHasta} onChange={(e) => { setFiltros({ ...filtros, fechaHasta: e.target.value }); setPage(1); }}
              className="px-3 py-1.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
          </div>

          {loading ? (
            <div className="p-8 text-center text-sm text-gray-500">Cargando...</div>
          ) : movimientos.length === 0 ? (
            <div className="p-8 text-center text-sm text-gray-500">No se encontraron movimientos.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-gray-50/50">
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Fecha</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Persona</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Concepto</th>
                    <th className="text-right px-4 py-3 font-medium text-gray-600">Valor</th>
                    <th className="text-right px-4 py-3 font-medium text-gray-600">Saldo</th>
                    <th className="text-center px-4 py-3 font-medium text-gray-600">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {movimientos.map((mov) => (
                    <tr key={mov.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-4 py-3 text-gray-900 whitespace-nowrap">
                        {formatDate(mov.fecha)} {mov.hora || ""}
                      </td>
                      <td className="px-4 py-3 text-gray-600">{mov.persona?.nombre || "-"}</td>
                      <td className="px-4 py-3">
                        <span className="text-gray-900">{mov.concepto}</span>
                        {mov.observaciones && <p className="text-xs text-gray-400">{mov.observaciones}</p>}
                      </td>
                      <td className={`px-4 py-3 text-right font-medium whitespace-nowrap ${mov.tipo === "INGRESO" ? "text-success" : "text-danger"}`}>
                        {mov.tipo === "INGRESO" ? "+" : "-"}{formatCurrency(mov.valor)}
                      </td>
                      <td className="px-4 py-3 text-right text-gray-600 whitespace-nowrap">{formatCurrency(mov.saldo)}</td>
                      <td className="px-4 py-3 text-center whitespace-nowrap">
                        <button onClick={() => handleEdit(mov)}
                          className="text-primary hover:text-primary-dark text-xs font-medium mr-3">
                          Editar
                        </button>
                        <button onClick={() => handleDelete(mov.id)}
                          className="text-danger hover:text-red-700 text-xs font-medium">
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2">
            <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1}
              className="px-3 py-1.5 text-sm border border-border rounded-lg hover:bg-gray-50 disabled:opacity-50">
              Anterior
            </button>
            <span className="text-sm text-gray-600">
              Página {page} de {totalPages}
            </span>
            <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages}
              className="px-3 py-1.5 text-sm border border-border rounded-lg hover:bg-gray-50 disabled:opacity-50">
              Siguiente
            </button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
