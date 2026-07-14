export function errorMiddleware(err, req, res, _next) {
  console.error("Error:", err.message);

  if (err.code === "P2002") {
    return res.status(409).json({ error: "DUPLICATE", message: "El valor ya existe." });
  }

  if (err.code === "P2025") {
    return res.status(404).json({ error: "NOT_FOUND", message: "Registro no encontrado." });
  }

  res.status(err.status || 500).json({
    error: err.code || "INTERNAL_ERROR",
    message: err.message || "Error interno del servidor.",
  });
}
