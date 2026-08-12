import bcrypt from "bcrypt";
import { prisma } from "../utils/prisma.js";

const SALT_ROUNDS = 10;

const selectPublico = {
  id: true,
  nombre: true,
  correo: true,
  rol: true,
  cuenta: true,
  creadoEn: true,
};

export async function listar() {
  return prisma.usuario.findMany({
    select: selectPublico,
    orderBy: { nombre: "asc" },
  });
}

export async function crear({ nombre, correo, password, rol, cuenta }) {
  const correoNormalizado = correo.toLowerCase().trim();

  const existente = await prisma.usuario.findUnique({ where: { correo: correoNormalizado } });
  if (existente) {
    const error = new Error("El correo ya está registrado.");
    error.status = 409;
    error.code = "EMAIL_EXISTS";
    throw error;
  }

  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

  return prisma.usuario.create({
    data: {
      nombre,
      correo: correoNormalizado,
      password: hashedPassword,
      rol,
      cuenta,
    },
    select: selectPublico,
  });
}

export async function cambiarRol(id, rol) {
  const existente = await prisma.usuario.findUnique({ where: { id } });
  if (!existente) {
    const error = new Error("Usuario no encontrado.");
    error.status = 404;
    error.code = "NOT_FOUND";
    throw error;
  }

  return prisma.usuario.update({
    where: { id },
    data: { rol },
    select: selectPublico,
  });
}

export async function eliminar(id, solicitanteId) {
  const existente = await prisma.usuario.findUnique({ where: { id } });
  if (!existente) {
    const error = new Error("Usuario no encontrado.");
    error.status = 404;
    error.code = "NOT_FOUND";
    throw error;
  }

  if (id === solicitanteId) {
    const error = new Error("No puedes eliminar tu propia cuenta.");
    error.status = 400;
    error.code = "SELF_DELETE";
    throw error;
  }

  await prisma.usuario.delete({ where: { id } });
}
