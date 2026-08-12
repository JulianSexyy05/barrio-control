import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config/env.js";

export function authMiddleware(req, res, next) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ error: "UNAUTHORIZED", message: "Token requerido." });
  }

  const token = header.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.usuario = decoded;
    next();
  } catch {
    return res.status(401).json({ error: "UNAUTHORIZED", message: "Token inválido o expirado." });
  }
}

export function authorizeRoles(...roles) {
  return (req, res, next) => {
    if (!req.usuario) {
      return res.status(401).json({ error: "UNAUTHORIZED", message: "Token requerido." });
    }

    if (!roles.includes(req.usuario.rol)) {
      return res.status(403).json({ error: "FORBIDDEN", message: "No tienes permisos para realizar esta acción." });
    }

    next();
  };
}
