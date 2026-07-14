import * as personaService from "../services/personaService.js";

export async function listar(req, res, next) {
  try {
    const { search } = req.query;
    const personas = await personaService.listar({ search });
    res.json(personas);
  } catch (error) {
    next(error);
  }
}

export async function crear(req, res, next) {
  try {
    const persona = await personaService.crear(req.body);
    res.status(201).json(persona);
  } catch (error) {
    next(error);
  }
}

export async function actualizar(req, res, next) {
  try {
    const { id } = req.params;
    const persona = await personaService.actualizar(parseInt(id), req.body);
    res.json(persona);
  } catch (error) {
    next(error);
  }
}

export async function eliminar(req, res, next) {
  try {
    const { id } = req.params;
    await personaService.eliminar(parseInt(id));
    res.json({ message: "Persona eliminada." });
  } catch (error) {
    next(error);
  }
}
