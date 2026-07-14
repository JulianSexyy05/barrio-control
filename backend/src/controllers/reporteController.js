import { generarPDF } from "../services/reporteService.js";

export async function descargarPDF(req, res, next) {
  try {
    const { fechaDesde, fechaHasta } = req.query;

    const pdf = await generarPDF(req.usuario.id, { fechaDesde, fechaHasta });

    const filename = `reporte-barrio-colombia-${
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
