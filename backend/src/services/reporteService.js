import PDFDocument from "pdfkit";
import { prisma } from "../utils/prisma.js";

function formatCurrency(n) {
  return "$" + Number(n || 0).toLocaleString("es-CO", { minimumFractionDigits: 0 });
}

function formatDate(d) {
  return new Date(d).toLocaleDateString("es-CO", { day: "2-digit", month: "long", year: "numeric" });
}

export async function generarPDF(usuarioId, { fechaDesde, fechaHasta } = {}) {
  const where = { usuarioId };
  if (fechaDesde || fechaHasta) {
    where.fecha = {};
    if (fechaDesde) where.fecha.gte = new Date(fechaDesde);
    if (fechaHasta) where.fecha.lte = new Date(fechaHasta + "T23:59:59.999Z");
  }

  const movimientos = await prisma.movimiento.findMany({
    where,
    include: { persona: { select: { nombre: true, casa: true } } },
    orderBy: [{ fecha: "asc" }, { id: "asc" }],
  });

  const usuario = await prisma.usuario.findUnique({ where: { id: usuarioId } });

  const resumen = {
    ingresos: movimientos.filter((m) => m.tipo === "INGRESO").reduce((s, m) => s + Number(m.valor), 0),
    egresos: movimientos.filter((m) => m.tipo === "EGRESO").reduce((s, m) => s + Number(m.valor), 0),
    count: movimientos.length,
    saldo: movimientos.length > 0 ? Number(movimientos[movimientos.length - 1].saldo) : 0,
  };

  const doc = new PDFDocument({ margin: 50, size: "LETTER" });
  const buffers = [];

  doc.on("data", (chunk) => buffers.push(chunk));

  return new Promise((resolve) => {
    doc.on("end", () => resolve(Buffer.concat(buffers)));

    const pageWidth = doc.page.width - 100;
    const leftMargin = 50;

    doc.font("Helvetica-Bold").fontSize(10).fillColor("#2563eb").text("BARRIOCONTROL", leftMargin, 45);

    doc.font("Helvetica").fontSize(8).fillColor("#6b7280")
      .text("Junta de Acción Comunal - Barrio Colombia", leftMargin, 62);

    doc.font("Helvetica-Bold").fontSize(16).fillColor("#111827")
      .text("Reporte de Movimientos", leftMargin, 85);

    const periodo = fechaDesde && fechaHasta
      ? `Del ${formatDate(fechaDesde)} al ${formatDate(fechaHasta)}`
      : "Todos los movimientos";
    doc.font("Helvetica").fontSize(9).fillColor("#6b7280").text(periodo, leftMargin, 107);

    if (usuario) {
      doc.font("Helvetica").fontSize(8).fillColor("#9ca3af")
        .text(`Generado por: ${usuario.nombre}`, leftMargin, 122);
    }

    const summaryY = 142;
    doc.roundedRect(leftMargin, summaryY, pageWidth, 60, 6).fill("#f8fafc").fillColor("#111827");

    const colW = pageWidth / 4;
    const summaryData = [
      { label: "Saldo actual", value: formatCurrency(resumen.saldo), color: "#111827" },
      { label: "Ingresos", value: formatCurrency(resumen.ingresos), color: "#16a34a" },
      { label: "Egresos", value: formatCurrency(resumen.egresos), color: "#dc2626" },
      { label: "Movimientos", value: resumen.count.toString(), color: "#2563eb" },
    ];

    let cx = leftMargin;
    for (const item of summaryData) {
      doc.font("Helvetica").fontSize(8).fillColor("#6b7280")
        .text(item.label, cx + 12, summaryY + 10, { width: colW - 24, align: "center" });
      doc.font("Helvetica-Bold").fontSize(11).fillColor(item.color)
        .text(item.value, cx + 12, summaryY + 28, { width: colW - 24, align: "center" });
      cx += colW;
    }

    const tableTop = summaryY + 80;
    const rowH = 20;
    const cols = [
      { label: "Fecha", width: 80, align: "left" },
      { label: "Persona", width: 100, align: "left" },
      { label: "Concepto", width: 150, align: "left" },
      { label: "Valor", width: 80, align: "right" },
      { label: "Saldo", width: 80, align: "right" },
    ];

    const tableWidth = cols.reduce((s, c) => s + c.width, 0);

    function drawHeader(y) {
      let hx = leftMargin;
      doc.roundedRect(leftMargin - 4, y - 2, tableWidth + 8, rowH + 4, 4).fill("#f1f5f9");
      for (const col of cols) {
        doc.font("Helvetica-Bold").fontSize(7).fillColor("#475569")
          .text(col.label, hx + 4, y + 3, { width: col.width - 8, align: col.align });
        hx += col.width;
      }
    }

    function drawRow(mov, y) {
      const isIngreso = mov.tipo === "INGRESO";
      let hx = leftMargin;
      const cells = [
        formatDate(mov.fecha) + (mov.hora ? ` ${mov.hora}` : ""),
        mov.persona?.nombre || "-",
        mov.concepto,
        (isIngreso ? "+" : "-") + formatCurrency(mov.valor),
        formatCurrency(mov.saldo),
      ];

      for (let i = 0; i < cols.length; i++) {
        const color = i === 3 ? (isIngreso ? "#16a34a" : "#dc2626") : "#111827";
        doc.font("Helvetica").fontSize(7.5).fillColor(color)
          .text(cells[i], hx + 4, y + 3, { width: cols[i].width - 8, align: cols[i].align });
        hx += cols[i].width;
      }
    }

    let currentY = tableTop;
    drawHeader(currentY);
    currentY += rowH + 6;

    if (movimientos.length === 0) {
      doc.font("Helvetica").fontSize(9).fillColor("#9ca3af")
        .text("No hay movimientos en el periodo seleccionado.", leftMargin, currentY + 10);
    } else {
      for (const mov of movimientos) {
        if (currentY + rowH > doc.page.height - 80) {
          doc.addPage();
          currentY = 50;
          drawHeader(currentY);
          currentY += rowH + 6;
        }
        drawRow(mov, currentY);
        currentY += rowH;
      }
    }

    const genDate = new Date().toLocaleString("es-CO", {
      day: "2-digit", month: "long", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });

    doc.font("Helvetica").fontSize(7).fillColor("#9ca3af")
      .text(`Documento generado el ${genDate}`, leftMargin, doc.page.height - 60, { width: pageWidth, align: "center" });

    doc.end();
  });
}
