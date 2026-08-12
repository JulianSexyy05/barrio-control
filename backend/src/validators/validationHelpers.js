import { validationResult } from "express-validator";

export function validate(req, res, next) {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: "VALIDATION_ERROR",
      message: "Datos inválidos.",
      details: errors.array().map((e) => ({ campo: e.path, mensaje: e.msg })),
    });
  }

  next();
}
