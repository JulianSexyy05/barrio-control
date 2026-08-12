import * as authService from "../services/authService.js";

export async function register(req, res, next) {
  try {
    const { nombre, correo, password, rol, cuenta } = req.body;
    const result = await authService.register({ nombre, correo, password, rol, cuenta });
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
}

export async function login(req, res, next) {
  try {
    const { correo, password } = req.body;
    const result = await authService.login({ correo, password });
    res.json(result);
  } catch (error) {
    next(error);
  }
}

export function me(req, res) {
  res.json({ usuario: req.usuario });
}
