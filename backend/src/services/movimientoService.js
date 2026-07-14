import { prisma } from "../utils/prisma.js";

async function recalcularSaldos(usuarioId, desdeId) {
  const movimientos = await prisma.movimiento.findMany({
    where: {
      usuarioId,
      ...(desdeId && { id: { gte: desdeId } }),
    },
    orderBy: [{ fecha: "asc" }, { id: "asc" }],
  });

  if (movimientos.length === 0) return;

  const firstId = movimientos[0].id;
  let saldoAnterior = 0;

  if (desdeId || firstId > 1) {
    const prev = await prisma.movimiento.findFirst({
      where: { usuarioId, id: { lt: firstId } },
      orderBy: [{ fecha: "desc" }, { id: "desc" }],
      select: { saldo: true },
    });
    saldoAnterior = prev?.saldo ? Number(prev.saldo) : 0;
  }

  for (const mov of movimientos) {
    const valor = Number(mov.valor);
    const nuevoSaldo = mov.tipo === "INGRESO" ? saldoAnterior + valor : saldoAnterior - valor;

    if (Number(mov.saldo) !== nuevoSaldo) {
      await prisma.movimiento.update({
        where: { id: mov.id },
        data: { saldo: nuevoSaldo },
      });
    }

    saldoAnterior = nuevoSaldo;
  }
}

export async function listar({ usuarioId, tipo, fechaDesde, fechaHasta, search, page = 1, limit = 20 }) {
  const where = { usuarioId };

  if (tipo) where.tipo = tipo;
  if (fechaDesde || fechaHasta) {
    where.fecha = {};
    if (fechaDesde) where.fecha.gte = new Date(fechaDesde);
    if (fechaHasta) where.fecha.lte = new Date(fechaHasta);
  }
  if (search) {
    where.OR = [
      { concepto: { contains: search, mode: "insensitive" } },
      { observaciones: { contains: search, mode: "insensitive" } },
    ];
  }

  const [movimientos, total] = await Promise.all([
    prisma.movimiento.findMany({
      where,
      include: { persona: { select: { id: true, nombre: true, casa: true } } },
      orderBy: [{ fecha: "desc" }, { id: "desc" }],
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.movimiento.count({ where }),
  ]);

  return { movimientos, total, page, totalPages: Math.ceil(total / limit) };
}

export async function crear(data) {
  const { fecha, hora, tipo, concepto, valor, observaciones, personaId, usuarioId } = data;

  const ultimoSaldo = await prisma.movimiento.findFirst({
    where: { usuarioId },
    orderBy: [{ fecha: "desc" }, { id: "desc" }],
    select: { saldo: true },
  });

  const saldoAnterior = ultimoSaldo?.saldo ? Number(ultimoSaldo.saldo) : 0;
  const valorNumerico = Number(valor);
  const saldo = tipo === "INGRESO" ? saldoAnterior + valorNumerico : saldoAnterior - valorNumerico;

  return prisma.movimiento.create({
    data: {
      fecha: new Date(fecha),
      hora: hora || null,
      tipo,
      concepto: concepto.trim(),
      valor: valorNumerico,
      saldo,
      observaciones: observaciones?.trim() || null,
      personaId: personaId || null,
      usuarioId,
    },
    include: { persona: { select: { id: true, nombre: true, casa: true } } },
  });
}

export async function actualizar(id, data, usuarioId) {
  const existente = await prisma.movimiento.findUnique({ where: { id } });
  if (!existente) {
    const error = new Error("Movimiento no encontrado.");
    error.status = 404;
    error.code = "NOT_FOUND";
    throw error;
  }
  if (existente.usuarioId !== usuarioId) {
    const error = new Error("No tienes permiso para modificar este movimiento.");
    error.status = 403;
    error.code = "FORBIDDEN";
    throw error;
  }

  const { fecha, hora, tipo, concepto, valor, observaciones, personaId } = data;

  await prisma.movimiento.update({
    where: { id },
    data: {
      ...(fecha && { fecha: new Date(fecha) }),
      ...(hora !== undefined && { hora }),
      ...(tipo && { tipo }),
      ...(concepto && { concepto: concepto.trim() }),
      ...(valor !== undefined && { valor: Number(valor) }),
      ...(observaciones !== undefined && { observaciones: observaciones?.trim() || null }),
      ...(personaId !== undefined && { personaId: personaId || null }),
    },
  });

  await recalcularSaldos(usuarioId, id);

  return prisma.movimiento.findUnique({
    where: { id },
    include: { persona: { select: { id: true, nombre: true, casa: true } } },
  });
}

export async function eliminar(id, usuarioId) {
  const existente = await prisma.movimiento.findUnique({ where: { id } });
  if (!existente) {
    const error = new Error("Movimiento no encontrado.");
    error.status = 404;
    error.code = "NOT_FOUND";
    throw error;
  }
  if (existente.usuarioId !== usuarioId) {
    const error = new Error("No tienes permiso para eliminar este movimiento.");
    error.status = 403;
    error.code = "FORBIDDEN";
    throw error;
  }

  await prisma.movimiento.delete({ where: { id } });

  await recalcularSaldos(usuarioId);
}

export async function obtenerSaldo(usuarioId) {
  const ultimo = await prisma.movimiento.findFirst({
    where: { usuarioId },
    orderBy: [{ fecha: "desc" }, { id: "desc" }],
    select: { saldo: true },
  });
  return { saldo: ultimo?.saldo ? Number(ultimo.saldo) : 0 };
}

export async function resumenMensual(usuarioId) {
  const ahora = new Date();
  const inicioMes = new Date(ahora.getFullYear(), ahora.getMonth(), 1);

  const [ingresos, egresos, count, saldoObj] = await Promise.all([
    prisma.movimiento.aggregate({
      where: { usuarioId, tipo: "INGRESO", fecha: { gte: inicioMes } },
      _sum: { valor: true },
    }),
    prisma.movimiento.aggregate({
      where: { usuarioId, tipo: "EGRESO", fecha: { gte: inicioMes } },
      _sum: { valor: true },
    }),
    prisma.movimiento.count({ where: { usuarioId, fecha: { gte: inicioMes } } }),
    obtenerSaldo(usuarioId),
  ]);

  return {
    saldoActual: saldoObj.saldo,
    ingresosMes: Number(ingresos._sum.valor || 0),
    egresosMes: Number(egresos._sum.valor || 0),
    movimientosMes: count,
  };
}
