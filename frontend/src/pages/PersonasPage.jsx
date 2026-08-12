import { useState, useEffect, useCallback } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import { useAuth } from "../hooks/useAuth";
import { listarPersonas, crearPersona, actualizarPersona, eliminarPersona } from "../services/personas";

const emptyForm = { nombre: "", casa: "", telefono: "", observaciones: "" };

export default function PersonasPage() {
  const { user } = useAuth();
  const [personas, setPersonas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const canEdit = user?.rol !== "CONSULTA";

  const loadPersonas = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (search.trim()) params.search = search.trim();
      const data = await listarPersonas(params);
      setPersonas(data);
    } catch (err) {
      console.error("Error loading personas:", err);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => { loadPersonas(); }, [loadPersonas]);

  const openNew = () => {
    setEditingId(null);
    setForm(emptyForm);
    setError("");
    setShowForm(true);
  };

  const handleEdit = (p) => {
    setEditingId(p.id);
    setForm({ nombre: p.nombre, casa: p.casa || "", telefono: p.telefono || "", observaciones: p.observaciones || "" });
    setError("");
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.nombre.trim()) {
      setError("El nombre es obligatorio.");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        nombre: form.nombre.trim(),
        casa: form.casa.trim() || null,
        telefono: form.telefono.trim() || null,
        observaciones: form.observaciones.trim() || null,
      };
      if (editingId) {
        await actualizarPersona(editingId, payload);
      } else {
        await crearPersona(payload);
      }
      setShowForm(false);
      setEditingId(null);
      setForm(emptyForm);
      loadPersonas();
    } catch (err) {
      setError(err.response?.data?.message || "Error al guardar la persona.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (p) => {
    if (!window.confirm(`¿Eliminar a ${p.nombre}?`)) return;
    try {
      await eliminarPersona(p.id);
      loadPersonas();
    } catch (err) {
      alert(err.response?.data?.message || "Error al eliminar.");
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Personas</h1>
            <p className="text-sm text-gray-500 mt-1">{personas.length} registros</p>
          </div>
          {canEdit && (
            <button
              onClick={() => { if (showForm && !editingId) setShowForm(false); else openNew(); }}
              className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-dark transition-colors"
            >
              {showForm && !editingId ? "Cancelar" : "+ Nueva persona"}
            </button>
          )}
        </div>

        {showForm && (
          <div className="bg-white rounded-xl border border-border shadow-sm p-5 mb-6">
            <h2 className="text-sm font-semibold text-gray-900 mb-4">
              {editingId ? "Editar persona" : "Nueva persona"}
            </h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Nombre *</label>
                <input type="text" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Casa / dirección</label>
                <input type="text" value={form.casa} onChange={(e) => setForm({ ...form, casa: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Teléfono</label>
                <input type="text" value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-gray-600 mb-1">Observaciones</label>
                <textarea value={form.observaciones} onChange={(e) => setForm({ ...form, observaciones: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" rows={2} />
              </div>

              {error && <p className="text-sm text-danger bg-danger-light px-3 py-2 rounded-lg sm:col-span-2">{error}</p>}

              <div className="sm:col-span-2 flex justify-end gap-3">
                <button type="button" onClick={() => { setShowForm(false); setEditingId(null); setForm(emptyForm); }}
                  className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors">
                  Cancelar
                </button>
                <button type="submit" disabled={saving}
                  className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50">
                  {saving ? "Guardando..." : editingId ? "Actualizar" : "Guardar"}
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="bg-white rounded-xl border border-border shadow-sm">
          <div className="p-4 border-b border-border">
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
              className="w-full sm:w-72 px-3 py-1.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" placeholder="Buscar por nombre o casa..." />
          </div>

          {loading ? (
            <div className="p-8 text-center text-sm text-gray-500">Cargando...</div>
          ) : personas.length === 0 ? (
            <div className="p-8 text-center text-sm text-gray-500">No se encontraron personas.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-gray-50/50">
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Nombre</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Casa</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Teléfono</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Observaciones</th>
                    <th className="text-center px-4 py-3 font-medium text-gray-600">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {personas.map((p) => (
                    <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-4 py-3 font-medium text-gray-900">{p.nombre}</td>
                      <td className="px-4 py-3 text-gray-600">{p.casa || "-"}</td>
                      <td className="px-4 py-3 text-gray-600">{p.telefono || "-"}</td>
                      <td className="px-4 py-3 text-gray-600 max-w-xs truncate">{p.observaciones || "-"}</td>
                      <td className="px-4 py-3 text-center whitespace-nowrap">
                        {canEdit && (
                          <>
                            <button onClick={() => handleEdit(p)}
                              className="text-primary hover:text-primary-dark text-xs font-medium mr-3">
                              Editar
                            </button>
                            <button onClick={() => handleDelete(p)}
                              className="text-danger hover:text-red-700 text-xs font-medium">
                              Eliminar
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
