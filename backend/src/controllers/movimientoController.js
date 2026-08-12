import * as movimientoService from "../services/movimientoService.js";

export async function listar(req, res, next) {
  try {
    const { tipo, fechaDesde, fechaHasta, search, page, limit } = req.query;
    const result = await movimientoService.listar({
      usuarioId: req.usuario.id,
      tipo,
      fechaDesde,
      fechaHasta,
      search,
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 20,
    });
    res.json(result);
  } catch (error) {
    next(error);
  }
}

export async function obtener(req, res, next) {
  try {
    const { id } = req.params;
    const movimiento = await movimientoService.obtener(parseInt(id), req.usuario.id);
    res.json(movimiento);
  } catch (error) {
    next(error);
  }
}

export async function crear(req, res, next) {
  try {
    const movimiento = await movimientoService.crear({
      ...req.body,
      usuarioId: req.usuario.id,
    });
    res.status(201).json(movimiento);
  } catch (error) {
    next(error);
  }
}

export async function actualizar(req, res, next) {
  try {
    const { id } = req.params;
    const movimiento = await movimientoService.actualizar(parseInt(id), req.body, req.usuario.id);
    res.json(movimiento);
  } catch (error) {
    next(error);
  }
}

export async function eliminar(req, res, next) {
  try {
    const { id } = req.params;
    await movimientoService.eliminar(parseInt(id), req.usuario.id);
    res.json({ message: "Movimiento eliminado." });
  } catch (error) {
    next(error);
  }
}

export async function saldo(req, res, next) {
  try {
    const result = await movimientoService.obtenerSaldo(req.usuario.id);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

export async function resumen(req, res, next) {
  try {
    const result = await movimientoService.resumenMensual(req.usuario.id);
    res.json(result);
  } catch (error) {
    next(error);
  }
}
