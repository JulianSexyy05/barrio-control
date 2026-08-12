import { body } from "express-validator";
import { validate } from "./validationHelpers.js";

export const registerValidators = [
  body("nombre").trim().notEmpty().withMessage("El nombre es obligatorio.").isLength({ max: 120 }).withMessage("El nombre no puede superar 120 caracteres."),
  body("correo").trim().notEmpty().withMessage("El correo es obligatorio.").isEmail().withMessage("El correo no es válido."),
  body("password").isLength({ min: 6 }).withMessage("La contraseña debe tener al menos 6 caracteres.").isLength({ max: 100 }).withMessage("La contraseña no puede superar 100 caracteres."),
  body("rol").optional().isIn(["EDITOR", "CONSULTA"]).withMessage("Rol no permitido."),
  body("cuenta").optional({ nullable: true }).trim().isLength({ max: 120 }).withMessage("La cuenta no puede superar 120 caracteres."),
  validate,
];

export const loginValidators = [
  body("correo").trim().notEmpty().withMessage("El correo es obligatorio.").isEmail().withMessage("El correo no es válido."),
  body("password").notEmpty().withMessage("La contraseña es obligatoria."),
  validate,
];
