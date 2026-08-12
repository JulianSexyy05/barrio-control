import { body, param, query } from "express-validator";
import { validate } from "./validationHelpers.js";

const campoConcepto = body("concepto").trim().notEmpty().withMessage("El concepto es obligatorio.").isLength({ max: 200 }).withMessage("El concepto no puede superar 200 caracteres.");
const campoFecha = body("fecha").isISO8601().withMessage("La fecha no es válida.");
const campoTipo = body("tipo").isIn(["INGRESO", "EGRESO"]).withMessage("El tipo debe ser INGRESO o EGRESO.");
const campoValor = body("valor").isFloat({ gt: 0 }).withMessage("El valor debe ser mayor a 0.");
const campoHora = body("hora").optional({ nullable: true }).matches(/^([01]\d|2[0-3]):[0-5]\d$/).withMessage("La hora no es válida.");
const campoPersonaId = body("personaId").optional({ nullable: true }).isInt({ min: 1 }).withMessage("La persona no es válida.");
const campoObservaciones = body("observaciones").optional({ nullable: true }).trim().isLength({ max: 500 }).withMessage("Las observaciones no pueden superar 500 caracteres.");

export const crearMovimientoValidators = [campoFecha, campoHora, campoTipo, campoConcepto, campoValor, campoPersonaId, campoObservaciones, validate];

export const actualizarMovimientoValidators = [
  param("id").isInt({ min: 1 }).withMessage("Id inválido."),
  campoFecha.optional(),
  campoHora,
  campoTipo.optional(),
  campoConcepto.optional(),
  campoValor.optional(),
  campoPersonaId,
  campoObservaciones,
  validate,
];

export const movimientoIdValidators = [
  param("id").isInt({ min: 1 }).withMessage("Id inválido."),
  validate,
];

export const listarMovimientoValidators = [
  query("tipo").optional().isIn(["INGRESO", "EGRESO"]).withMessage("Tipo inválido."),
  query("fechaDesde").optional().isISO8601().withMessage("Fecha desde inválida."),
  query("fechaHasta").optional().isISO8601().withMessage("Fecha hasta inválida."),
  query("page").optional().isInt({ min: 1 }).withMessage("Página inválida."),
  query("limit").optional().isInt({ min: 1, max: 100 }).withMessage("Límite inválido."),
  validate,
];
