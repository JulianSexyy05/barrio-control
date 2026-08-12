import { body, param } from "express-validator";
import { validate } from "./validationHelpers.js";

const personaFields = {
  nombre: body("nombre").trim().notEmpty().withMessage("El nombre es obligatorio.").isLength({ max: 120 }).withMessage("El nombre no puede superar 120 caracteres."),
  casa: body("casa").optional({ nullable: true }).trim().isLength({ max: 120 }).withMessage("La casa no puede superar 120 caracteres."),
  telefono: body("telefono").optional({ nullable: true }).trim().isLength({ max: 30 }).withMessage("El teléfono no puede superar 30 caracteres."),
  observaciones: body("observaciones").optional({ nullable: true }).trim().isLength({ max: 500 }).withMessage("Las observaciones no pueden superar 500 caracteres."),
};

export const crearPersonaValidators = [personaFields.nombre, personaFields.casa, personaFields.telefono, personaFields.observaciones, validate];

export const actualizarPersonaValidators = [
  param("id").isInt({ min: 1 }).withMessage("Id inválido."),
  personaFields.nombre.optional(),
  personaFields.casa,
  personaFields.telefono,
  personaFields.observaciones,
  validate,
];

export const personaIdValidators = [
  param("id").isInt({ min: 1 }).withMessage("Id inválido."),
  validate,
];
