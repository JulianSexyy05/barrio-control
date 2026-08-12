import { body, param } from "express-validator";
import { validate } from "./validationHelpers.js";

const ROLES = ["ADMIN", "EDITOR", "CONSULTA"];

export const crearUsuarioValidators = [
  body("nombre").trim().notEmpty().withMessage("El nombre es obligatorio.").isLength({ max: 120 }).withMessage("El nombre no puede superar 120 caracteres."),
  body("correo").trim().notEmpty().withMessage("El correo es obligatorio.").isEmail().withMessage("El correo no es válido."),
  body("password").isLength({ min: 6 }).withMessage("La contraseña debe tener al menos 6 caracteres.").isLength({ max: 100 }).withMessage("La contraseña no puede superar 100 caracteres."),
  body("rol").isIn(ROLES).withMessage("Rol inválido."),
  body("cuenta").optional({ nullable: true }).trim().isLength({ max: 120 }).withMessage("La cuenta no puede superar 120 caracteres."),
  validate,
];

export const cambiarRolValidators = [
  param("id").isInt({ min: 1 }).withMessage("Id inválido."),
  body("rol").isIn(ROLES).withMessage("Rol inválido."),
  validate,
];

export const usuarioIdValidators = [
  param("id").isInt({ min: 1 }).withMessage("Id inválido."),
  validate,
];
