import { useState, useEffect, useCallback } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import { useAuth } from "../hooks/useAuth";
import { listarUsuarios, crearUsuario, cambiarRolUsuario, eliminarUsuario } from "../services/usuarios";

const ROLES = [
  { value: "ADMIN", label: "Administrador" },
  { value: "EDITOR", label: "Editor" },
  { value: "CONSULTA", label: "Consulta" },
];

const emptyForm = { nombre: "", correo: "", password: "", rol: "EDITOR", cuenta: "" };

function roleLabel(rol) {
  return ROLES.find((r) => r.value === rol)?.label || rol;
}

export default function UsuariosPage() {
  const { user } = useAuth();
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [changing, setChanging] = useState({});

  const loadUsuarios = useCallback(async () => {
    setLoading(true);
    try {
      const data = await listarUsuarios();
      setUsuarios(data);
    } catch (err) {
      console.error("Error loading usuarios:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadUsuarios(); }, [loadUsuarios]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.nombre.trim() || !form.correo.trim() || !form.password) {
      setError("Completa nombre, correo y contraseña.");
      return;
    }
    if (form.password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    setSaving(true);
    try {
      await crearUsuario({
        nombre: form.nombre.trim(),
        correo: form.correo.trim(),
        password: form.password,
        rol: form.rol,
        cuenta: form.cuenta.trim() || null,
      });
      setForm(emptyForm);
      setShowForm(false);
      loadUsuarios();
    } catch (err) {
      setError(err.response?.data?.message || "Error al crear el usuario.");
    } finally {
      setSaving(false);
    }
  };

  const handleChangeRol = async (u, rol) => {
    if (u.id === user.id) {
      alert("No puedes cambiar tu propio rol.");
      return;
    }
    if (!window.confirm(`¿Cambiar el rol de ${u.nombre} a ${roleLabel(rol)}?`)) return;

    setChanging((prev) => ({ ...prev, [u.id]: true }));
    try {
      await cambiarRolUsuario(u.id, rol);
      loadUsuarios();
    } catch (err) {
      alert(err.response?.data?.message || "Error al cambiar el rol.");
    } finally {
      setChanging((prev) => ({ ...prev, [u.id]: false }));
    }
  };

  const handleDelete = async (u) => {
    if (u.id === user.id) {
      alert("No puedes eliminar tu propia cuenta.");
      return;
    }
    if (!window.confirm(`¿Eliminar a ${u.nombre}?`)) return;
    try {
      await eliminarUsuario(u.id);
      loadUsuarios();
    } catch (err) {
      alert(err.response?.data?.message || "Error al eliminar.");
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Usuarios</h1>
            <p className="text-sm text-gray-500 mt-1">Administración de cuentas y usuarios</p>
          </div>
          <button
            onClick={() => { setShowForm(!showForm); setForm(emptyForm); setError(""); }}
            className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-dark transition-colors"
          >
            {showForm ? "Cancelar" : "+ Nuevo usuario"}
          </button>
        </div>

        {showForm && (
          <div className="bg-white rounded-xl border border-border shadow-sm p-5 mb-6">
            <h2 className="text-sm font-semibold text-gray-900 mb-4">Nuevo usuario</h2>
            <form onSubmit={handleCreate} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Nombre *</label>
                <input type="text" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Correo *</label>
                <input type="email" value={form.correo} onChange={(e) => setForm({ ...form, correo: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Contraseña *</label>
                <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Rol *</label>
                <select value={form.rol} onChange={(e) => setForm({ ...form, rol: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary">
                  {ROLES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-gray-600 mb-1">Cuenta</label>
                <input type="text" value={form.cuenta} onChange={(e) => setForm({ ...form, cuenta: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
              </div>

              {error && <p className="text-sm text-danger bg-danger-light px-3 py-2 rounded-lg sm:col-span-2">{error}</p>}

              <div className="sm:col-span-2 flex justify-end gap-3">
                <button type="button" onClick={() => { setShowForm(false); setForm(emptyForm); }}
                  className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors">
                  Cancelar
                </button>
                <button type="submit" disabled={saving}
                  className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50">
                  {saving ? "Creando..." : "Crear usuario"}
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="bg-white rounded-xl border border-border shadow-sm">
          {loading ? (
            <div className="p-8 text-center text-sm text-gray-500">Cargando...</div>
          ) : usuarios.length === 0 ? (
            <div className="p-8 text-center text-sm text-gray-500">No hay usuarios.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-gray-50/50">
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Nombre</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Correo</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Cuenta</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Rol</th>
                    <th className="text-center px-4 py-3 font-medium text-gray-600">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {usuarios.map((u) => (
                    <tr key={u.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-4 py-3 font-medium text-gray-900">
                        {u.nombre}
                        {u.id === user.id && <span className="ml-2 text-xs text-gray-400">(tú)</span>}
                      </td>
                      <td className="px-4 py-3 text-gray-600">{u.correo}</td>
                      <td className="px-4 py-3 text-gray-600">{u.cuenta || "-"}</td>
                      <td className="px-4 py-3">
                        <select
                          value={u.rol}
                          onChange={(e) => handleChangeRol(u, e.target.value)}
                          disabled={u.id === user.id || changing[u.id]}
                          className="px-2 py-1 border border-border rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
                        >
                          {ROLES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
                        </select>
                      </td>
                      <td className="px-4 py-3 text-center whitespace-nowrap">
                        <button onClick={() => handleDelete(u)}
                          className="text-danger hover:text-red-700 text-xs font-medium disabled:opacity-50"
                          disabled={u.id === user.id}>
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
      </div>
    </DashboardLayout>
  );
}
