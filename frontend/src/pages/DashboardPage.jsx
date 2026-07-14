import { useState, useEffect } from "react";
import { obtenerResumen, listarMovimientos } from "../services/movimientos";
import { useAuth } from "../hooks/useAuth";
import DashboardLayout from "../layouts/DashboardLayout";
import { Link } from "react-router-dom";

function formatCurrency(value) {
  return new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(value || 0);
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString("es-CO", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [resumen, setResumen] = useState(null);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [res, mov] = await Promise.all([
          obtenerResumen(),
          listarMovimientos({ limit: 5 }),
        ]);
        setResumen(res);
        setRecent(mov.movimientos || []);
      } catch (err) {
        console.error("Error loading dashboard:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500">Cargando...</p>
        </div>
      </DashboardLayout>
    );
  }

  const cards = [
    { label: "Saldo actual", value: formatCurrency(resumen?.saldoActual), color: "text-gray-900" },
    { label: "Ingresos del mes", value: formatCurrency(resumen?.ingresosMes), color: "text-success" },
    { label: "Egresos del mes", value: formatCurrency(resumen?.egresosMes), color: "text-danger" },
    { label: "Movimientos del mes", value: resumen?.movimientosMes || 0, color: "text-primary" },
  ];

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
            <p className="text-sm text-gray-500 mt-1">
              Bienvenido, {user?.nombre || "Usuario"}
            </p>
          </div>
          <Link
            to="/movimientos?nuevo=true"
            className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-dark transition-colors"
          >
            + Nuevo movimiento
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {cards.map((card) => (
            <div key={card.label} className="bg-white rounded-xl border border-border p-5 shadow-sm">
              <p className="text-sm text-gray-500 mb-1">{card.label}</p>
              <p className={`text-2xl font-semibold ${card.color}`}>{card.value}</p>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-xl border border-border shadow-sm">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <h2 className="text-sm font-semibold text-gray-900">Últimos movimientos</h2>
            <Link to="/movimientos" className="text-sm text-primary hover:underline">
              Ver todos
            </Link>
          </div>
          {recent.length === 0 ? (
            <div className="p-5 text-center text-sm text-gray-500">
              No hay movimientos registrados aún.
            </div>
          ) : (
            <div className="divide-y divide-border">
              {recent.map((mov) => (
                <div key={mov.id} className="flex items-center justify-between px-5 py-3">
                  <div className="flex items-center gap-3">
                    <span className={`w-2 h-2 rounded-full ${mov.tipo === "INGRESO" ? "bg-success" : "bg-danger"}`} />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{mov.concepto}</p>
                      <p className="text-xs text-gray-500">
                        {formatDate(mov.fecha)} {mov.hora || ""} · {mov.persona?.nombre || "Sin persona"}
                      </p>
                    </div>
                  </div>
                  <span className={`text-sm font-semibold ${mov.tipo === "INGRESO" ? "text-success" : "text-danger"}`}>
                    {mov.tipo === "INGRESO" ? "+" : "-"}{formatCurrency(mov.valor)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
