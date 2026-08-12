import { generarPDF } from "../services/reporteService.js";

export async function descargarPDF(req, res, next) {
  try {
    const { fechaDesde, fechaHasta } = req.query;

    const pdf = await generarPDF(req.usuario.id, { fechaDesde, fechaHasta });

    const cuentaSlug = (req.usuario.cuenta || "cuenta")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    const filename = `reporte-${cuentaSlug}-${
      fechaDesde && fechaHasta
        ? `${fechaDesde}_a_${fechaHasta}`
        : "todos"
    }.pdf`;

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.setHeader("Content-Length", pdf.length);
    res.send(pdf);
  } catch (error) {
    next(error);
  }
}
