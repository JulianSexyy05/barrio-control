import { prisma } from "../utils/prisma.js";

export async function listar({ search } = {}) {
  const where = {};
  if (search) {
    where.OR = [
      { nombre: { contains: search, mode: "insensitive" } },
      { casa: { contains: search, mode: "insensitive" } },
    ];
  }

  return prisma.persona.findMany({
    where,
    orderBy: { nombre: "asc" },
  });
}

export async function crear(data) {
  const { nombre, casa, telefono, observaciones } = data;

  return prisma.persona.create({
    data: {
      nombre: nombre.trim(),
      casa: casa?.trim() || null,
      telefono: telefono?.trim() || null,
      observaciones: observaciones?.trim() || null,
    },
  });
}

export async function actualizar(id, data) {
  const existente = await prisma.persona.findUnique({ where: { id } });
  if (!existente) {
    const error = new Error("Persona no encontrada.");
    error.status = 404;
    error.code = "NOT_FOUND";
    throw error;
  }

  const { nombre, casa, telefono, observaciones } = data;

  return prisma.persona.update({
    where: { id },
    data: {
      ...(nombre && { nombre: nombre.trim() }),
      ...(casa !== undefined && { casa: casa?.trim() || null }),
      ...(telefono !== undefined && { telefono: telefono?.trim() || null }),
      ...(observaciones !== undefined && { observaciones: observaciones?.trim() || null }),
    },
  });
}

export async function eliminar(id) {
  const existente = await prisma.persona.findUnique({ where: { id } });
  if (!existente) {
    const error = new Error("Persona no encontrada.");
    error.status = 404;
    error.code = "NOT_FOUND";
    throw error;
  }

  await prisma.persona.delete({ where: { id } });
}
