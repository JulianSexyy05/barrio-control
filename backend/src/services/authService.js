import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { prisma } from "../utils/prisma.js";
import { JWT_SECRET, JWT_EXPIRES_IN } from "../config/env.js";

const SALT_ROUNDS = 10;

export async function register({ nombre, correo, password, rol, barrio }) {
  const existente = await prisma.usuario.findUnique({ where: { correo } });
  if (existente) {
    const error = new Error("El correo ya está registrado.");
    error.status = 409;
    error.code = "EMAIL_EXISTS";
    throw error;
  }

  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

  const usuario = await prisma.usuario.create({
    data: { nombre, correo, password: hashedPassword, rol, barrio },
    select: { id: true, nombre: true, correo: true, rol: true, barrio: true, creadoEn: true },
  });

  const token = jwt.sign(
    { id: usuario.id, nombre: usuario.nombre, correo: usuario.correo, rol: usuario.rol, barrio: usuario.barrio },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );

  return { usuario, token };
}

export async function login({ correo, password }) {
  const usuario = await prisma.usuario.findUnique({ where: { correo } });
  if (!usuario) {
    const error = new Error("Correo o contraseña incorrectos.");
    error.status = 401;
    error.code = "INVALID_CREDENTIALS";
    throw error;
  }

  const valida = await bcrypt.compare(password, usuario.password);
  if (!valida) {
    const error = new Error("Correo o contraseña incorrectos.");
    error.status = 401;
    error.code = "INVALID_CREDENTIALS";
    throw error;
  }

  const token = jwt.sign(
    { id: usuario.id, nombre: usuario.nombre, correo: usuario.correo, rol: usuario.rol, barrio: usuario.barrio },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );

  return {
    usuario: { id: usuario.id, nombre: usuario.nombre, correo: usuario.correo, rol: usuario.rol, barrio: usuario.barrio },
    token,
  };
}
