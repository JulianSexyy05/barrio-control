import * as usuarioService from "../services/usuarioService.js";

export async function listar(req, res, next) {
  try {
    const usuarios = await usuarioService.listar();
    res.json(usuarios);
  } catch (error) {
    next(error);
  }
}

export async function crear(req, res, next) {
  try {
    const usuario = await usuarioService.crear(req.body);
    res.status(201).json(usuario);
  } catch (error) {
    next(error);
  }
}

export async function cambiarRol(req, res, next) {
  try {
    const { id } = req.params;
    const { rol } = req.body;
    const usuario = await usuarioService.cambiarRol(parseInt(id), rol);
    res.json(usuario);
  } catch (error) {
    next(error);
  }
}

export async function eliminar(req, res, next) {
  try {
    const { id } = req.params;
    await usuarioService.eliminar(parseInt(id), req.usuario.id);
    res.json({ message: "Usuario eliminado." });
  } catch (error) {
    next(error);
  }
}
